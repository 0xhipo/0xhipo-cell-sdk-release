import {
    BotInfo,
    CancelOrderParams,
    CloseBotParams,
    CloseSolanaBotMarketParams,
    CreateBotParams,
    GetBotInfoParams,
    GetOpenOrdersParams,
    OpenOrder,
    OrderSide,
    OrderType,
    PlaceOrderParams,
    SerumMarketConfig,
    SolanaTokenConfig,
    StopBotParams,
    TransactionPayload,
} from '../../type';
import {
    genValidBotAccount,
    getATABalance,
    getATAKey,
    getBotKeyBySeed,
    getCellCacheKey,
    getCellConfigAccountKey,
    getMarketPrice,
    getSerumMarketConfig,
    getSerumOpenOrdersAccountInfo,
    getSerumOpenOrdersAccountKey,
    getTokenConfigBySymbol,
    nativeToUi,
    redeemAllFromBot,
    serumOrderTypeTransform,
    uiToNative,
} from '../../util';
import {
    createATAIx,
    createBotIx,
    serumCancelOrderIx,
    serumCloseOpenOrdersIx,
    serumInitOpenOrdersIx,
    serumPlaceOrderIx,
    serumSettleFundsIx,
    stopBotIx,
} from '../../instruction';
import { PublicKey } from '@solana/web3.js';
import { Market, Orderbook } from '@project-serum/serum';
import { SERUM_PROGRAM_ID, ZERO_DECIMAL } from '../../constant';
import Decimal from 'decimal.js';

export class SerumBot {
    /*
     * txPayload: [createBotQuoteTokenATA, createBotBaseTokenATA, createBotIx, createSerumOpenOrdersIx]
     * returns [botSeed, dexAccountKey, orderOwnerKey, txPayload]
     */
    static async create(params: CreateBotParams): Promise<[Uint8Array, PublicKey, PublicKey, TransactionPayload]> {
        const [botSeed, botKey, botMintKey] = await genValidBotAccount(params.programId);
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const baseTokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;
        const quoteTokenConfig = getTokenConfigBySymbol(marketConfig.quoteSymbol) as SolanaTokenConfig;

        const cellConfigKey = await getCellConfigAccountKey(params.programId);
        const cellCacheKey = await getCellCacheKey(botKey, params.botOwner, params.programId);

        const ownerUSDCATA = await getATAKey(params.botOwner, quoteTokenConfig.mintKey);
        const ownerBotMintATA = await getATAKey(params.botOwner, botMintKey);
        const botQuoteTokenATA = await getATAKey(botKey, quoteTokenConfig.mintKey);
        const botBaseTokenATA = await getATAKey(botKey, baseTokenConfig.mintKey);

        const serumOpenOrdersAccountKey = await getSerumOpenOrdersAccountKey(botKey, params.programId);

        const payload: TransactionPayload = {
            instructions: [
                createATAIx({
                    ataKey: botBaseTokenATA,
                    ownerKey: botKey,
                    mintKey: baseTokenConfig.mintKey,
                    payerKey: params.botOwner,
                }),
                createATAIx({
                    ataKey: botQuoteTokenATA,
                    ownerKey: botKey,
                    mintKey: quoteTokenConfig.mintKey,
                    payerKey: params.botOwner,
                }),
                createBotIx({
                    botSeed,
                    depositAssetQuantity: uiToNative(params.depositAssetQuantity, 6),
                    lowerPrice: uiToNative(params.lowerPrice, 6),
                    upperPrice: uiToNative(params.upperPrice, 6),
                    gridNum: params.gridNum,
                    marketKey: params.marketKey,
                    leverage: uiToNative(params.leverage, 2),
                    botKey,
                    botMintKey,
                    botAssetKey: botQuoteTokenATA,
                    userAssetKey: ownerUSDCATA,
                    userBotTokenKey: ownerBotMintATA,
                    assetPriceKey: quoteTokenConfig.pythPriceKey,
                    userKey: params.botOwner,
                    protocol: params.protocol,
                    botType: params.botType,
                    stopTopRatio: params.stopTopRatio,
                    stopBottomRatio: params.stopBottomRatio,
                    trigger: params.trigger,
                    isPool: false,
                    startPrice: uiToNative(params.startPrice, 6),
                    cellCacheAccount: cellCacheKey,
                    programId: params.programId,
                }),
                serumInitOpenOrdersIx({
                    botSeed,
                    userOrBotDelegateAccount: params.botOwner,
                    marketAccount: params.marketKey,
                    openOrdersAccount: serumOpenOrdersAccountKey,
                    botAccount: botKey,
                    cellConfigAccount: cellConfigKey,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
        return [botSeed, serumOpenOrdersAccountKey, serumOpenOrdersAccountKey, payload];
    }

    static async stop(params: StopBotParams): Promise<TransactionPayload> {
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const baseTokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const cellConfigKey = await getCellConfigAccountKey(params.programId);
        return {
            instructions: [
                stopBotIx({
                    botSeed: params.botSeed,
                    botKey,
                    userKey: params.payer,
                    pythPriceAccount: baseTokenConfig.pythPriceKey,
                    cellConfigAccount: cellConfigKey,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    /*
     * returns BotInfo {
     *      value: (botBaseToken + ooaBaseTokenTotal) * basePrice + (botQuoteToken + ooaQuoteTokenTotal) * quotePrice
     *      position: botBaseToken + ooaBaseTokenTotal
     * }
     */
    static async getBotInfo(params: GetBotInfoParams): Promise<BotInfo> {
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const baseTokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;
        const quoteTokenConfig = getTokenConfigBySymbol(marketConfig.quoteSymbol) as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const botBaseATA = await getATAKey(botKey, baseTokenConfig.mintKey);
        const botQuoteATA = await getATAKey(botKey, quoteTokenConfig.mintKey);

        const serumOpenOrdersAccountKey = await getSerumOpenOrdersAccountKey(botKey, params.programId);

        const [openOrdersAccountInfo, basePrice, quotePrice, botBaseTokenBalance, botQuoteTokenBalance] =
            await Promise.all([
                getSerumOpenOrdersAccountInfo(params.connection, serumOpenOrdersAccountKey),
                getMarketPrice(baseTokenConfig.name),
                getMarketPrice(quoteTokenConfig.name),
                getATABalance(params.connection, botBaseATA),
                getATABalance(params.connection, botQuoteATA),
            ]);

        const baseTokenBalance = openOrdersAccountInfo
            ? botBaseTokenBalance.add(nativeToUi(openOrdersAccountInfo.baseTokenTotal, baseTokenConfig.decimals))
            : botBaseTokenBalance;
        const quoteTokenBalance = openOrdersAccountInfo
            ? botQuoteTokenBalance.add(nativeToUi(openOrdersAccountInfo.quoteTokenTotal, quoteTokenConfig.decimals))
            : botQuoteTokenBalance;
        return {
            position: baseTokenBalance,
            value: baseTokenBalance.mul(basePrice).add(quoteTokenBalance.mul(quotePrice)),
        };
    }

    static async getOpenOrders(params: GetOpenOrdersParams): Promise<OpenOrder[]> {
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(botKey, params.programId);

        const [market, bidsInfo, asksInfo] = await Promise.all([
            Market.load(params.connection, params.marketKey, {}, SERUM_PROGRAM_ID),
            params.connection.getAccountInfo(marketConfig.bids),
            params.connection.getAccountInfo(marketConfig.asks),
        ]);

        if (!bidsInfo || !asksInfo) {
            throw `Get open orders error: bids / asks not available`;
        }

        const bids = Orderbook.decode(market, bidsInfo.data);
        const asks = Orderbook.decode(market, asksInfo.data);

        return [...bids, ...asks]
            .filter((o) => o.openOrdersAddress.equals(openOrdersAccountKey))
            .map((i) => {
                return {
                    price: new Decimal(i['price']),
                    size: new Decimal(i['size']),
                    side: i['side'] == 'buy' ? OrderSide.Bid : OrderSide.Ask,
                    orderId: i['orderId'].toString(),
                    clientId: i['clientId'] ? i['clientId'].toString() : null,
                };
            });
    }

    /*
     * Serum order size using source token amount
     * e.g. SOL/USDC market, Buy order amount is USDC amount, Sell order amount is SOL amount
     */
    static async placeOrder(params: PlaceOrderParams): Promise<TransactionPayload> {
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const baseTokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;
        const quoteTokenConfig = getTokenConfigBySymbol(marketConfig.quoteSymbol) as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(botKey, params.programId);
        const botAssetATA =
            params.side == OrderSide.Bid
                ? await getATAKey(botKey, quoteTokenConfig.mintKey)
                : await getATAKey(botKey, baseTokenConfig.mintKey);
        const cellConfigKey = await getCellConfigAccountKey(params.programId);

        const nativePrice = uiToNative(params.price, marketConfig.orderPriceDecimals);
        const size = params.side == OrderSide.Bid ? params.price.mul(params.quantity) : params.quantity;
        const nativeSize =
            params.side == OrderSide.Bid
                ? uiToNative(size, quoteTokenConfig.decimals)
                : uiToNative(size, baseTokenConfig.decimals);
        return {
            instructions: [
                serumPlaceOrderIx({
                    botSeed: params.botSeed,
                    side: params.side,
                    orderType: serumOrderTypeTransform(params.orderType),
                    limitPrice: nativePrice,
                    amountToTrade: nativeSize,
                    coinLotSize: marketConfig.baseLotSize,
                    pcLotSize: marketConfig.quoteLotSize,
                    clientOrderId: params.clientId,
                    userOrBotDelegateAccount: params.payer,
                    marketAccount: params.marketKey,
                    openOrdersAccount: openOrdersAccountKey,
                    requestQueueAccount: marketConfig.requestQueue,
                    eventQueueAccount: marketConfig.eventQueue,
                    bidsAccount: marketConfig.bids,
                    asksAccount: marketConfig.asks,
                    // TODO if pool using working cap account
                    botOrWorkingCapAssetAccount: botAssetATA,
                    botOrWorkingCapAccount: botKey,
                    botAccount: botKey,
                    coinVault: marketConfig.baseVault,
                    pcVault: marketConfig.quoteVault,
                    cellConfigAccount: cellConfigKey,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    static async cancelOrder(params: CancelOrderParams): Promise<TransactionPayload> {
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(botKey, params.programId);
        const cellConfigKey = await getCellConfigAccountKey(params.programId);
        return {
            instructions: [
                serumCancelOrderIx({
                    botSeed: params.botSeed,
                    side: params.side,
                    orderId: params.orderId,
                    userOrBotDelegateAccount: params.payer,
                    marketAccount: params.marketKey,
                    bidsAccount: marketConfig.bids,
                    asksAccount: marketConfig.asks,
                    openOrdersAccount: openOrdersAccountKey,
                    botAccount: botKey,
                    eventQueueAccount: marketConfig.eventQueue,
                    cellConfigAccount: cellConfigKey,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    static async closeMarket(params: CloseSolanaBotMarketParams): Promise<TransactionPayload | undefined> {
        const botInfo = await this.getBotInfo({
            protocol: params.protocol,
            connection: params.connection,
            botSeed: params.botSeed,
            marketKey: params.marketKey,
            programId: params.programId,
        });

        if (botInfo.position.eq(ZERO_DECIMAL)) {
            return;
        }

        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const quoteTokenConfig = getTokenConfigBySymbol(marketConfig.quoteSymbol) as SolanaTokenConfig;

        const side = botInfo.position.gt(ZERO_DECIMAL) ? OrderSide.Ask : OrderSide.Bid;
        // buy order with maximum price, e.g. quote token decimal = 6, buy with price 1e7-1 = 999999
        // sell order with minimum price, e.g. order price decimal is 3, sell with 1e-3 = 0.001
        const price =
            side == OrderSide.Bid
                ? uiToNative(new Decimal(1), quoteTokenConfig.decimals + 1).sub(new Decimal(1))
                : nativeToUi(new Decimal(1), marketConfig.orderPriceDecimals);

        return this.placeOrder({
            protocol: params.protocol,
            price,
            quantity: botInfo.position.abs(),
            side,
            orderType: OrderType.IOC,
            clientId: new Date().getTime().toString(),
            botSeed: params.botSeed,
            marketKey: params.marketKey,
            payer: params.payer,
            programId: params.programId,
        });
    }

    /*
     * Requirement: No open orders
     * 1. Close open orders account
     * 2. Redeem all base & quote token from bot
     */
    static async close(params: CloseBotParams): Promise<(TransactionPayload | undefined)[]> {
        const openOrders = await this.getOpenOrders({
            protocol: params.protocol,
            connection: params.connection,
            botSeed: params.botSeed,
            marketKey: params.marketKey,
            programId: params.programId,
        });
        if (openOrders.length > 0) {
            throw `Close bot error: open orders existed`;
        }

        const payloads: (TransactionPayload | undefined)[] = [];

        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const baseTokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;
        const quoteTokenConfig = getTokenConfigBySymbol(marketConfig.quoteSymbol) as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const botBaseATA = await getATAKey(botKey, baseTokenConfig.mintKey);
        const botQuoteATA = await getATAKey(botKey, quoteTokenConfig.mintKey);
        const cellConfigKey = await getCellConfigAccountKey(params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(botKey, params.programId);
        const [openOrdersAccountInfo, botBaseTokenBalance, botQuoteTokenBalance] = await Promise.all([
            getSerumOpenOrdersAccountInfo(params.connection, openOrdersAccountKey),
            getATABalance(params.connection, botBaseATA),
            getATABalance(params.connection, botQuoteATA),
        ]);

        const ooaBase = openOrdersAccountInfo
            ? nativeToUi(openOrdersAccountInfo.baseTokenTotal, baseTokenConfig.decimals)
            : ZERO_DECIMAL;
        const ooaQuote = openOrdersAccountInfo
            ? nativeToUi(openOrdersAccountInfo.quoteTokenTotal, quoteTokenConfig.decimals)
            : ZERO_DECIMAL;
        const baseTotal = botBaseTokenBalance.add(ooaBase);
        const quoteTotal = botQuoteTokenBalance.add(ooaQuote);

        // 1. Close open orders account
        if (openOrdersAccountInfo) {
            console.log(`Close open orders account ${openOrdersAccountKey.toString()}`);
            console.log(`Open orders base ${ooaBase}, quote ${ooaQuote}`);
            const closeOpenOrdersAccountPayload: TransactionPayload = {
                instructions: [
                    serumSettleFundsIx({
                        botSeed: params.botSeed,
                        userOrBotDelegateAccount: params.owner,
                        marketAccount: params.marketKey,
                        openOrdersAccount: openOrdersAccountKey,
                        botAccount: botKey,
                        coinVault: marketConfig.baseVault,
                        coinWalletAccount: botBaseATA,
                        pcVault: marketConfig.quoteVault,
                        pcWalletAccount: botQuoteATA,
                        vaultSigner: marketConfig.vaultSigner,
                        cellConfigAccount: cellConfigKey,
                        programId: params.programId,
                    }),
                    serumCloseOpenOrdersIx({
                        botSeed: params.botSeed,
                        userOrBotDelegateAccount: params.owner,
                        openOrdersAccount: openOrdersAccountKey,
                        botAccount: botKey,
                        userAccount: params.owner,
                        marketAccount: params.marketKey,
                        cellConfigAccount: cellConfigKey,
                        programId: params.programId,
                    }),
                ],
                signers: [],
            };
            payloads.push(closeOpenOrdersAccountPayload);
        } else {
            payloads.push(undefined);
        }

        // 2. Redeem all base & quote token from bot
        const redeemTokens: string[] = [];
        if (baseTotal.gt(ZERO_DECIMAL)) {
            console.log(`Redeem ${baseTotal} ${baseTokenConfig.name} from bot`);
            redeemTokens.push(baseTokenConfig.name);
        }
        if (quoteTotal.gt(ZERO_DECIMAL)) {
            console.log(`Redeem ${quoteTotal} ${quoteTokenConfig.name} from bot`);
            redeemTokens.push(quoteTokenConfig.name);
        }
        if (redeemTokens.length > 0) {
            const redeemAllFromBotPayload = await redeemAllFromBot(
                params.connection,
                params.botSeed,
                params.owner,
                params.referrer,
                params.cellAdmin,
                redeemTokens,
                params.programId,
            );
            payloads.push(redeemAllFromBotPayload);
        } else {
            payloads.push(undefined);
        }
        return payloads;
    }
}
