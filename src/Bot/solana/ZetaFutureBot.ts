import {
    BotInfo,
    CancelOrderParams,
    CloseBotParams,
    CreateBotParams,
    GetBotInfoParams,
    GetOpenOrdersParams,
    OpenOrder,
    OrderSide,
    PlaceOrderParams,
    StopBotParams,
    SolanaTokenConfig,
    TransactionPayload,
    ZetaAssetConfig,
    ZetaFutureMarketConfig,
    ZetaOrderSide,
} from '../../type';
import {
    genValidBotAccount,
    getATABalance,
    getATAKey,
    getBotKeyBySeed,
    getBotZetaMarginAccountKeyBySeed,
    getBotZetaOpenOrdersAccountKey,
    getCellCacheKey,
    getCellConfigAccountKey,
    getMarketPrice,
    getSerumOpenOrdersAccountInfo,
    getTokenConfigBySymbol,
    getZetaAssetConfigBySymbol,
    getZetaFutureMarketConfig,
    getZetaMarginAccount,
    getZetaOpenOrdersMapKey,
    nativeToUi,
    Numberu128,
    redeemAllFromBot,
    uiToNative,
    uiZetaPriceToNative,
    zetaOrderSideTransform,
    zetaOrderTypeTransform,
} from '../../util';
import { ZERO_DECIMAL, ZETA_DEX_PROGRAM_ID } from '../../constant';
import {
    cancelZetaOrderIx,
    closeZetaOpenOrdersIx,
    createATAIx,
    createBotIx,
    depositToZetaIx,
    initZetaMarginAccountIx,
    initZetaOpenOrdersIx,
    placeZetaOrderIx,
    settleZetaMarketIx,
    stopBotIx,
    withdrawFromZetaIx,
} from '../../instruction';
import { PublicKey } from '@solana/web3.js';
import { Market, Orderbook } from '@project-serum/serum';
import Decimal from 'decimal.js';

export class ZetaFutureBot {
    /*
     * returns [botSeed, dexAccountKey, orderOwnerKey, txPayload]
     */
    static async create(params: CreateBotParams): Promise<[Uint8Array, PublicKey, PublicKey, TransactionPayload]> {
        const [botSeed, botKey, botMintKey] = await genValidBotAccount(params.programId);
        const marketConfig = getZetaFutureMarketConfig(params.marketKey) as ZetaFutureMarketConfig;
        const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;
        const usdcConfig = getTokenConfigBySymbol('USDC') as SolanaTokenConfig;

        const cellConfigKey = await getCellConfigAccountKey(params.programId);
        const cellCacheKey = await getCellCacheKey(botKey, params.botOwner, params.programId);

        const ownerUSDCATA = await getATAKey(params.botOwner, usdcConfig.mintKey);
        const ownerBotMintATA = await getATAKey(params.botOwner, botMintKey);
        const botUSDCATA = await getATAKey(botKey, usdcConfig.mintKey);

        const dexAccountKey = await getBotZetaMarginAccountKeyBySeed(
            botSeed,
            assetConfig.groupAccount,
            params.programId,
        );
        const orderOwnerKey = await getBotZetaOpenOrdersAccountKey(botKey, params.marketKey);
        const zetaOpenOrdersMapKey = await getZetaOpenOrdersMapKey(orderOwnerKey).then((res) => res[0]);

        const payload: TransactionPayload = {
            instructions: [
                createATAIx({
                    ataKey: botUSDCATA,
                    ownerKey: botKey,
                    mintKey: usdcConfig.mintKey,
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
                    botAssetKey: botUSDCATA,
                    userAssetKey: ownerUSDCATA,
                    userBotTokenKey: ownerBotMintATA,
                    assetPriceKey: usdcConfig.pythPriceKey,
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
                initZetaMarginAccountIx({
                    botSeed,
                    botAccount: botKey,
                    userOrBotDelegateAccount: params.botOwner,
                    zetaMarginAccount: dexAccountKey,
                    zetaAccountOwnerAccount: botKey,
                    cellConfigAccount: cellConfigKey,
                    zetaGroupKey: assetConfig.groupAccount,
                    programId: params.programId,
                }),
                initZetaOpenOrdersIx({
                    botSeed,
                    botAccount: botKey,
                    userOrBotDelegateAccount: params.botOwner,
                    openOrdersAccount: orderOwnerKey,
                    zetaMarginAccount: dexAccountKey,
                    marketAccount: params.marketKey,
                    openOrdersMapAccount: zetaOpenOrdersMapKey,
                    cellConfigAccount: cellConfigKey,
                    zetaGroupKey: assetConfig.groupAccount,
                    programId: params.programId,
                }),
                depositToZetaIx({
                    botSeed,
                    amount: uiToNative(params.depositAssetQuantity, 6),
                    botAccount: botKey,
                    userOrBotDelegateAccount: params.botOwner,
                    zetaMarginAccount: dexAccountKey,
                    botTokenAccount: botUSDCATA,
                    cellConfigAccount: cellConfigKey,
                    zetaGroupKey: assetConfig.groupAccount,
                    zetaVaultKey: assetConfig.vaultAccount,
                    zetaGreeksKey: assetConfig.greeksAccount,
                    zetaSocializedLossKey: assetConfig.socializedLossAccount,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };

        return [botSeed, dexAccountKey, orderOwnerKey, payload];
    }

    static async stop(params: StopBotParams): Promise<TransactionPayload> {
        const marketConfig = getZetaFutureMarketConfig(params.marketKey) as ZetaFutureMarketConfig;
        const tokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const cellConfigAccount = await getCellConfigAccountKey(params.programId);

        return {
            instructions: [
                stopBotIx({
                    botSeed: params.botSeed,
                    botKey,
                    userKey: params.payer,
                    pythPriceAccount: tokenConfig.pythPriceKey,
                    cellConfigAccount,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    static async getOpenOrders(params: GetOpenOrdersParams): Promise<OpenOrder[]> {
        const marketConfig = getZetaFutureMarketConfig(params.marketKey) as ZetaFutureMarketConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const zetaOpenOrdersAccountKey = await getBotZetaOpenOrdersAccountKey(botKey, params.marketKey);

        const [market, bidsInfo, asksInfo] = await Promise.all([
            Market.load(params.connection, params.marketKey, {}, ZETA_DEX_PROGRAM_ID),
            params.connection.getAccountInfo(marketConfig.bids),
            params.connection.getAccountInfo(marketConfig.asks),
        ]);

        if (!bidsInfo || !asksInfo) {
            throw `Get open orders error: bids / asks not available`;
        }

        const bids = Orderbook.decode(market, bidsInfo.data);
        const asks = Orderbook.decode(market, asksInfo.data);

        return [...bids, ...asks]
            .filter((o) => o.openOrdersAddress.equals(zetaOpenOrdersAccountKey))
            .map((i) => {
                return {
                    price: new Decimal(i.price),
                    size: nativeToUi(new Decimal(i.size), marketConfig.orderQuantityDecimals),
                    side: i.side == 'buy' ? OrderSide.Bid : OrderSide.Ask,
                    orderId: i.orderId.toString(),
                    clientId: i.clientId ? i.clientId.toString() : null,
                };
            });
    }

    static async getBotInfo(params: GetBotInfoParams): Promise<BotInfo> {
        const marketConfig = getZetaFutureMarketConfig(params.marketKey) as ZetaFutureMarketConfig;
        const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;
        const tokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;

        const zetaMarginAccountKey = await getBotZetaMarginAccountKeyBySeed(
            params.botSeed,
            assetConfig.groupAccount,
            params.programId,
        );
        const zetaMarginAccount = await getZetaMarginAccount(params.connection, zetaMarginAccountKey);

        const position = nativeToUi(
            new Decimal(zetaMarginAccount.productLedgers[marketConfig.marketIndex].position.size.toString()),
            3,
        );
        const costOfTrades = nativeToUi(
            new Decimal(zetaMarginAccount.productLedgers[marketConfig.marketIndex].position.costOfTrades.toString()),
            6,
        );
        const balance = nativeToUi(new Decimal(zetaMarginAccount.balance.toString()), 6);

        const marketPrice = await getMarketPrice(tokenConfig.name);

        let unrealizedPnl = ZERO_DECIMAL;
        if (position.gt(ZERO_DECIMAL)) {
            unrealizedPnl = position.mul(marketPrice).sub(costOfTrades);
        } else if (position.lt(ZERO_DECIMAL)) {
            unrealizedPnl = position.mul(marketPrice).add(costOfTrades);
        }

        return {
            value: balance.add(unrealizedPnl),
            position,
        };
    }

    static async placeOrder(params: PlaceOrderParams): Promise<TransactionPayload> {
        const side = zetaOrderSideTransform(params.side);
        const orderType = zetaOrderTypeTransform(params.orderType);

        const marketConfig = getZetaFutureMarketConfig(params.marketKey) as ZetaFutureMarketConfig;
        const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;

        const cellConfigAccount = await getCellConfigAccountKey(params.programId);
        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const zetaMarginAccountKey = await getBotZetaMarginAccountKeyBySeed(
            params.botSeed,
            assetConfig.groupAccount,
            params.programId,
        );
        const zetaOpenOrdersAccountKey = await getBotZetaOpenOrdersAccountKey(botKey, params.marketKey);

        return {
            instructions: [
                placeZetaOrderIx({
                    botSeed: params.botSeed,
                    // TODO order book price with 4 decimal, tx price data need 6 decimal?
                    price: uiZetaPriceToNative(params.price),
                    size: uiToNative(params.quantity, marketConfig.orderQuantityDecimals),
                    side,
                    orderType,
                    clientOrderId: params.clientId,
                    botAccount: botKey,
                    userOrBotDelegateAccount: params.payer,
                    zetaMarginAccount: zetaMarginAccountKey,
                    openOrdersAccount: zetaOpenOrdersAccountKey,
                    marketAccount: params.marketKey,
                    requestQueueAccount: marketConfig.requestQueue,
                    eventQueueAccount: marketConfig.eventQueue,
                    bidsAccount: marketConfig.bids,
                    asksAccount: marketConfig.asks,
                    orderPayerTokenAccount:
                        side == ZetaOrderSide.Bid ? marketConfig.zetaQuoteVault : marketConfig.zetaBaseVault,
                    coinVault: marketConfig.baseVault,
                    pcVault: marketConfig.quoteVault,
                    pcWallet: marketConfig.zetaQuoteVault,
                    coinWallet: marketConfig.zetaBaseVault,
                    zetaMarketNode: marketConfig.greekNodeKey,
                    zetaMarketMint: side == ZetaOrderSide.Bid ? marketConfig.quoteMint : marketConfig.baseMint,
                    cellConfigAccount,
                    zetaGroupKey: assetConfig.groupAccount,
                    zetaGroupOracleKey: assetConfig.oracleAccount,
                    zetaGreeksKey: assetConfig.greeksAccount,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    static async cancelOrder(params: CancelOrderParams): Promise<TransactionPayload> {
        const side = zetaOrderSideTransform(params.side);

        const marketConfig = getZetaFutureMarketConfig(params.marketKey) as ZetaFutureMarketConfig;
        const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;

        const cellConfigAccount = await getCellConfigAccountKey(params.programId);
        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const zetaMarginAccountKey = await getBotZetaMarginAccountKeyBySeed(
            params.botSeed,
            assetConfig.groupAccount,
            params.programId,
        );
        const zetaOpenOrdersAccountKey = await getBotZetaOpenOrdersAccountKey(botKey, params.marketKey);
        return {
            instructions: [
                cancelZetaOrderIx({
                    botSeed: params.botSeed,
                    side,
                    orderId: new Numberu128(params.orderId),
                    botAccount: botKey,
                    userOrBotDelegateAccount: params.payer,
                    zetaMarginAccount: zetaMarginAccountKey,
                    openOrdersAccount: zetaOpenOrdersAccountKey,
                    marketAccount: params.marketKey,
                    bidsAccount: marketConfig.bids,
                    asksAccount: marketConfig.asks,
                    eventQueueAccount: marketConfig.eventQueue,
                    cellConfigAccount,
                    zetaGroupKey: assetConfig.groupAccount,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    /*
     * Requirement: 1. Zero position; 2. No open orders
     * 1. Close open orders account
     * 2. Redeem all USDC from Zeta
     * 3. Redeem all USDC from bot
     */
    static async close(params: CloseBotParams): Promise<(TransactionPayload | undefined)[]> {
        const payloads: (TransactionPayload | undefined)[] = [];

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

        const botInfo = await this.getBotInfo({
            protocol: params.protocol,
            connection: params.connection,
            botSeed: params.botSeed,
            marketKey: params.marketKey,
            programId: params.programId,
        });

        if (!botInfo.position.eq(ZERO_DECIMAL)) {
            throw `Close bot error: position not zero`;
        }

        const marketConfig = getZetaFutureMarketConfig(params.marketKey) as ZetaFutureMarketConfig;
        const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;
        const usdcConfig = getTokenConfigBySymbol('USDC') as SolanaTokenConfig;

        const cellConfigAccount = await getCellConfigAccountKey(params.programId);
        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const botUSDCATA = await getATAKey(botKey, usdcConfig.mintKey);

        const zetaMarginAccountKey = await getBotZetaMarginAccountKeyBySeed(
            params.botSeed,
            assetConfig.groupAccount,
            params.programId,
        );
        const zetaOpenOrdersAccountKey = await getBotZetaOpenOrdersAccountKey(botKey, params.marketKey);
        const [zetaOpenOrdersMapKey, zetaOpenOrdersMapNonce] = await getZetaOpenOrdersMapKey(zetaOpenOrdersAccountKey);
        const openOrdersAccountInfo = await getSerumOpenOrdersAccountInfo(params.connection, zetaOpenOrdersAccountKey);

        // 1. Close open orders account
        if (openOrdersAccountInfo) {
            console.log(`Close open orders account ${zetaOpenOrdersAccountKey.toString()}`);
            const closeOOAPayload: TransactionPayload = {
                instructions: [
                    settleZetaMarketIx({
                        marketKey: params.marketKey,
                        baseVault: marketConfig.zetaBaseVault,
                        quoteVault: marketConfig.zetaQuoteVault,
                        dexBaseVault: marketConfig.baseVault,
                        dexQuoteVault: marketConfig.quoteVault,
                        vaultOwner: marketConfig.vaultOwner,
                        openOrdersAccount: zetaOpenOrdersAccountKey,
                    }),
                    closeZetaOpenOrdersIx({
                        botSeed: params.botSeed,
                        botAccount: botKey,
                        userOrBotDelegateAccount: params.owner,
                        zetaMarginAccount: zetaMarginAccountKey,
                        openOrdersAccount: zetaOpenOrdersAccountKey,
                        openOrdersMapAccount: zetaOpenOrdersMapKey,
                        openOrdersMapNonce: zetaOpenOrdersMapNonce,
                        marketAccount: params.marketKey,
                        cellConfigAccount,
                        zetaGroupKey: assetConfig.groupAccount,
                        userKey: params.owner,
                        programId: params.programId,
                    }),
                ],
                signers: [],
            };
            payloads.push(closeOOAPayload);
        } else {
            payloads.push(undefined);
        }

        // 2. Redeem all USDC from Zeta
        if (!botInfo.value.eq(ZERO_DECIMAL)) {
            console.log(`Redeem ${botInfo.value} USDC from Zeta`);
            const redeemAllFromDexPayload: TransactionPayload = {
                instructions: [
                    withdrawFromZetaIx({
                        botSeed: params.botSeed,
                        amount: uiToNative(botInfo.value, 6),
                        botAccount: botKey,
                        userOrBotDelegateAccount: params.owner,
                        zetaMarginAccount: zetaMarginAccountKey,
                        botTokenAccount: botUSDCATA,
                        cellConfigAccount,
                        zetaGroupKey: assetConfig.groupAccount,
                        zetaGroupOracleKey: assetConfig.oracleAccount,
                        zetaVaultKey: assetConfig.vaultAccount,
                        zetaGreeksKey: assetConfig.greeksAccount,
                        zetaSocializedLossKey: assetConfig.socializedLossAccount,
                        programId: params.programId,
                    }),
                ],
                signers: [],
            };
            payloads.push(redeemAllFromDexPayload);
        } else {
            payloads.push(undefined);
        }

        // 3. Redeem all USDC from bot
        const botUSDCBalance = await getATABalance(params.connection, botUSDCATA).then((res) => res.add(botInfo.value));
        if (!botUSDCBalance.eq(ZERO_DECIMAL)) {
            console.log(`Redeem ${botUSDCBalance} USDC from bot`);
            const redeemAllFromBotPayload = await redeemAllFromBot(
                params.connection,
                params.botSeed,
                params.owner,
                params.referrer,
                params.cellAdmin,
                ['USDC'],
                params.programId,
            );
            payloads.push(redeemAllFromBotPayload);
        } else {
            payloads.push(undefined);
        }
        return payloads;
    }
}
