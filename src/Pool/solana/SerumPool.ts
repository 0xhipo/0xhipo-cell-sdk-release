import {
    AdjustPoolReserveParams,
    CancelOrderParams,
    CreateBotParams,
    DepositPoolParams,
    GetOpenOrdersParams,
    GetPoolInfoParams,
    OpenOrder,
    OrderSide,
    PlaceOrderParams,
    PoolInfo,
    RedeemPoolParams,
    SerumMarketConfig,
    SolanaTokenConfig,
    TransactionPayload,
} from '../../type';
import {
    createATA,
    genValidBotAccount,
    getATABalance,
    getATAKey,
    getBotKeyBySeed,
    getBotMintKeyBySeed2,
    getCellCacheKey,
    getCellConfigAccountKey,
    getMarketPrice,
    getSerumMarketConfig,
    getSerumOpenOrdersAccountInfo,
    getSerumOpenOrdersAccountKey,
    getSerumPoolWorkingCapKey,
    getTokenConfigBySymbol,
    nativeToUi,
    serumOrderTypeTransform,
    uiToNative,
} from '../../util';
import {
    createATAIx,
    createBotIx,
    serumCancelOrderIx,
    serumInitOpenOrdersIx,
    serumPlaceOrderIx,
    serumPoolAdjustReserveIx,
    serumPoolDepositIx,
    serumPoolWithdrawIx,
    serumSettleFundsIx,
} from '../../instruction';
import { PublicKey } from '@solana/web3.js';
import { SERUM_PROGRAM_ID, ZERO_DECIMAL } from '../../constant';
import { Market, Orderbook } from '@project-serum/serum';
import Decimal from 'decimal.js';

export class SerumPool {
    /*
     * txPayload: [createBotQuoteTokenATA, createBotBaseTokenATA, createBotIx, createSerumOpenOrdersIx]
     * returns [botSeed, workingCapKey, orderOwnerKey, txPayload]
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

        const workingCapKey = await getSerumPoolWorkingCapKey(botKey, params.programId);
        const serumOpenOrdersAccountKey = await getSerumOpenOrdersAccountKey(workingCapKey, params.programId);

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
                    depositBaseBalance: ZERO_DECIMAL,
                    depositQuoteBalance: uiToNative(params.depositQuoteBalance, 6),
                    lowerPrice: uiToNative(params.lowerPrice, 6),
                    upperPrice: uiToNative(params.upperPrice, 6),
                    gridNum: params.gridNum,
                    marketKey: params.marketKey,
                    leverage: uiToNative(params.leverage, 2),
                    isDualDeposit: false,
                    botKey,
                    botMintKey,
                    botAssetKeys: [botQuoteTokenATA],
                    userAssetKeys: [ownerUSDCATA],
                    userBotTokenKey: ownerBotMintATA,
                    assetPriceKeys: [quoteTokenConfig.pythPriceKey],
                    userKey: params.botOwner,
                    protocol: params.protocol,
                    botType: params.botType,
                    stopTopRatio: params.stopTopRatio,
                    stopBottomRatio: params.stopBottomRatio,
                    trigger: params.trigger,
                    isPool: true,
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
                    botOrWorkingCapAccount: workingCapKey,
                    cellConfigAccount: cellConfigKey,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
        return [botSeed, workingCapKey, serumOpenOrdersAccountKey, payload];
    }

    static async deposit(params: DepositPoolParams): Promise<TransactionPayload> {
        const payload: TransactionPayload = { instructions: [], signers: [] };

        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const baseTokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;
        const quoteTokenConfig = getTokenConfigBySymbol(marketConfig.quoteSymbol) as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const botMintKey = await getBotMintKeyBySeed2(params.botSeed, params.programId);
        const workingCapKey = await getSerumPoolWorkingCapKey(botKey, params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(workingCapKey, params.programId);
        const cellCacheKey = await getCellCacheKey(botKey, params.investor, params.programId);

        const botQuoteATA = await getATAKey(botKey, quoteTokenConfig.mintKey);
        const investorUSDCATA = await getATAKey(params.investor, quoteTokenConfig.mintKey);
        const [investorBotMintATA, createInvestorBotMintATAIx] = await createATA(
            params.connection,
            params.investor,
            botMintKey,
            params.investor,
        );
        if (createInvestorBotMintATAIx) {
            payload.instructions.push(createInvestorBotMintATAIx);
        }
        const [workingCapBaseATA, createWorkingCapBaseATAIx] = await createATA(
            params.connection,
            workingCapKey,
            baseTokenConfig.mintKey,
            params.investor,
        );
        if (createWorkingCapBaseATAIx) {
            payload.instructions.push(createWorkingCapBaseATAIx);
        }

        const [workingCapQuoteATA, createWorkingCapQuoteATAIx] = await createATA(
            params.connection,
            workingCapKey,
            quoteTokenConfig.mintKey,
            params.investor,
        );
        if (createWorkingCapQuoteATAIx) {
            payload.instructions.push(createWorkingCapQuoteATAIx);
        }

        payload.instructions.push(
            serumPoolDepositIx({
                botSeed: params.botSeed,
                amount: uiToNative(params.amount, 6),
                botAccount: botKey,
                botMintAccount: botMintKey,
                investorAccount: params.investor,
                investorAssetAccount: investorUSDCATA,
                investorBotTokenAccount: investorBotMintATA,
                botAssetAccount: botQuoteATA,
                workingCapAccount: workingCapKey,
                workingCapBaseTokenAccount: workingCapBaseATA,
                workingCapQuoteTokenAccount: workingCapQuoteATA,
                openOrdersAccount: openOrdersAccountKey,
                marketAccount: params.marketKey,
                cellCacheAccount: cellCacheKey,
                baseTokenPythPriceAccount: baseTokenConfig.pythPriceKey,
                quoteTokenPythPriceAccount: quoteTokenConfig.pythPriceKey,
                programId: params.programId,
            }),
        );
        return payload;
    }

    static async redeem(params: RedeemPoolParams): Promise<TransactionPayload> {
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const baseTokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;
        const quoteTokenConfig = getTokenConfigBySymbol(marketConfig.quoteSymbol) as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const botMintKey = await getBotMintKeyBySeed2(params.botSeed, params.programId);
        const workingCapKey = await getSerumPoolWorkingCapKey(botKey, params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(workingCapKey, params.programId);
        const cellCacheKey = await getCellCacheKey(botKey, params.investor, params.programId);
        const cellConfigKey = await getCellConfigAccountKey(params.programId);

        const botQuoteATA = await getATAKey(botKey, quoteTokenConfig.mintKey);
        const workingCapBaseATA = await getATAKey(workingCapKey, baseTokenConfig.mintKey);
        const workingCapQuoteATA = await getATAKey(workingCapKey, quoteTokenConfig.mintKey);
        const investorQuoteATA = await getATAKey(params.investor, quoteTokenConfig.mintKey);
        const investorBotMintATA = await getATAKey(params.investor, botMintKey);
        const botOwnerQuoteATA = await getATAKey(params.botOwner, quoteTokenConfig.mintKey);
        const cellAdminQuoteATA = await getATAKey(params.cellAdmin, quoteTokenConfig.mintKey);

        return {
            instructions: [
                serumPoolWithdrawIx({
                    botSeed: params.botSeed,
                    amount: uiToNative(params.amount, 6),
                    botAccount: botKey,
                    botMintAccount: botMintKey,
                    investorAccount: params.investor,
                    investorAssetAccount: investorQuoteATA,
                    investorBotTokenAccount: investorBotMintATA,
                    botAssetAccount: botQuoteATA,
                    cellCacheAccount: cellCacheKey,
                    cellConfigAccount: cellConfigKey,
                    cellAssetAccount: cellAdminQuoteATA,
                    botOwnerAssetAccount: botOwnerQuoteATA,
                    workingCapAccount: workingCapKey,
                    workingCapBaseTokenAccount: workingCapBaseATA,
                    workingCapQuoteTokenAccount: workingCapQuoteATA,
                    openOrdersAccount: openOrdersAccountKey,
                    marketAccount: params.marketKey,
                    baseTokenPythPriceAccount: baseTokenConfig.pythPriceKey,
                    quoteTokenPythPriceAccount: quoteTokenConfig.pythPriceKey,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    static async adjustReserve(params: AdjustPoolReserveParams): Promise<TransactionPayload> {
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const baseTokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;
        const quoteTokenConfig = getTokenConfigBySymbol(marketConfig.quoteSymbol) as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const workingCapKey = await getSerumPoolWorkingCapKey(botKey, params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(workingCapKey, params.programId);
        const cellConfigKey = await getCellConfigAccountKey(params.programId);

        const botQuoteATA = await getATAKey(botKey, quoteTokenConfig.mintKey);
        const workingCapBaseATA = await getATAKey(workingCapKey, baseTokenConfig.mintKey);
        const workingCapQuoteATA = await getATAKey(workingCapKey, quoteTokenConfig.mintKey);
        return {
            instructions: [
                serumSettleFundsIx({
                    botSeed: params.botSeed,
                    userOrBotDelegateAccount: params.payer,
                    marketAccount: params.marketKey,
                    openOrdersAccount: openOrdersAccountKey,
                    botOrWorkingCapAccount: workingCapKey,
                    botAccount: botKey,
                    coinVault: marketConfig.baseVault,
                    coinWalletAccount: workingCapBaseATA,
                    pcVault: marketConfig.quoteVault,
                    pcWalletAccount: workingCapQuoteATA,
                    vaultSigner: marketConfig.vaultSigner,
                    cellConfigAccount: cellConfigKey,
                    programId: params.programId,
                }),
                serumPoolAdjustReserveIx({
                    botSeed: params.botSeed,
                    botAccount: botKey,
                    userOrBotDelegateAccount: params.payer,
                    botAssetAccount: botQuoteATA,
                    workingCapAccount: workingCapKey,
                    workingCapBaseTokenAccount: workingCapBaseATA,
                    workingCapQuoteTokenAccount: workingCapQuoteATA,
                    openOrdersAccount: openOrdersAccountKey,
                    marketAccount: params.marketKey,
                    cellConfigAccount: cellConfigKey,
                    baseTokenPythPriceAccount: baseTokenConfig.pythPriceKey,
                    quoteTokenPythPriceAccount: quoteTokenConfig.pythPriceKey,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    /*
     * botValue = (basePrice * botBase) + (quotePrice * botQuote)
     * dexValue = (basePrice * (workingCapBase + ooaBase)) + (quotePrice * (workingCapQuote + ooaQuote))
     * position = workingCapBase + ooaBase
     */
    static async getPoolInfo(params: GetPoolInfoParams): Promise<PoolInfo> {
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const baseTokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;
        const quoteTokenConfig = getTokenConfigBySymbol(marketConfig.quoteSymbol) as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const workingCapKey = await getSerumPoolWorkingCapKey(botKey, params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(workingCapKey, params.programId);

        const botBaseATA = await getATAKey(botKey, baseTokenConfig.mintKey);
        const botQuoteATA = await getATAKey(botKey, quoteTokenConfig.mintKey);
        const workingCapBaseATA = await getATAKey(workingCapKey, baseTokenConfig.mintKey);
        const workingCapQuoteATA = await getATAKey(workingCapKey, quoteTokenConfig.mintKey);

        // TODO get multiple account by single connection
        const [
            basePrice,
            quotePrice,
            botBaseBalance,
            botQuoteBalance,
            workingCapBaseBalance,
            workingCapQuoteBalance,
            openOrdersAccountInfo,
        ] = await Promise.all([
            getMarketPrice(baseTokenConfig.name),
            getMarketPrice(quoteTokenConfig.name),
            getATABalance(params.connection, botBaseATA),
            getATABalance(params.connection, botQuoteATA),
            getATABalance(params.connection, workingCapBaseATA),
            getATABalance(params.connection, workingCapQuoteATA),
            getSerumOpenOrdersAccountInfo(params.connection, openOrdersAccountKey),
        ]);
        const ooaUiBaseTotal = openOrdersAccountInfo
            ? nativeToUi(openOrdersAccountInfo.baseTokenTotal, baseTokenConfig.decimals)
            : ZERO_DECIMAL;
        const ooaUiQuoteTotal = openOrdersAccountInfo
            ? nativeToUi(openOrdersAccountInfo.quoteTokenTotal, quoteTokenConfig.decimals)
            : ZERO_DECIMAL;

        const botValue = basePrice.mul(botBaseBalance).add(quotePrice.mul(botQuoteBalance));
        const dexValue = basePrice
            .mul(workingCapBaseBalance.add(ooaUiBaseTotal))
            .add(quotePrice.mul(workingCapQuoteBalance.add(ooaUiQuoteTotal)));
        const position = workingCapBaseBalance.add(ooaUiBaseTotal);
        return {
            botValue,
            dexValue,
            position,
        };
    }

    static async getOpenOrders(params: GetOpenOrdersParams): Promise<OpenOrder[]> {
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const workingCapKey = await getSerumPoolWorkingCapKey(botKey, params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(workingCapKey, params.programId);

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

    static async placeOrder(params: PlaceOrderParams): Promise<TransactionPayload> {
        const marketConfig = getSerumMarketConfig(params.marketKey) as SerumMarketConfig;
        const baseTokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as SolanaTokenConfig;
        const quoteTokenConfig = getTokenConfigBySymbol(marketConfig.quoteSymbol) as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const workingCapKey = await getSerumPoolWorkingCapKey(botKey, params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(workingCapKey, params.programId);
        const workingCapAssetATA =
            params.side == OrderSide.Bid
                ? await getATAKey(workingCapKey, quoteTokenConfig.mintKey)
                : await getATAKey(workingCapKey, baseTokenConfig.mintKey);
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
                    botOrWorkingCapAssetAccount: workingCapAssetATA,
                    botOrWorkingCapAccount: workingCapKey,
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
        const workingCapKey = await getSerumPoolWorkingCapKey(botKey, params.programId);
        const openOrdersAccountKey = await getSerumOpenOrdersAccountKey(workingCapKey, params.programId);
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
                    botOrWorkingCapAccount: workingCapKey,
                    botAccount: botKey,
                    eventQueueAccount: marketConfig.eventQueue,
                    cellConfigAccount: cellConfigKey,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }
}
