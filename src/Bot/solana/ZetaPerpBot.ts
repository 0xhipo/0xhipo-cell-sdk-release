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
    TokenConfig,
    TransactionPayload,
    ZetaAssetConfig,
    ZetaOrderSide,
    ZetaPerpMarketConfig,
} from '../../type';
import {
    createATA,
    genValidBotAccount,
    getATABalance,
    getATAKey,
    getBotKeyBySeed,
    getBotMintKeyBySeed2,
    getBotZetaMarginAccountKeyBySeed,
    getBotZetaOpenOrdersAccountKey,
    getCellCacheKey,
    getCellConfigAccountKey,
    getPythPrice,
    getSerumOpenOrdersAccountInfo,
    getTokenConfigBySymbol,
    getZetaAssetConfigBySymbol,
    getZetaMarginAccount,
    getZetaOpenOrdersMapKey,
    getZetaPerpMarketConfig,
    nativeToUi,
    Numberu128,
    uiToNative,
    uiZetaPriceToNative,
    zetaOrderSideTransform,
    zetaOrderTypeTransform,
} from '../../util';
import { ADMIN_ACCOUNT, SOLANA_TOKEN, ZERO_DECIMAL, ZETA_DEX_PROGRAM_ID } from '../../constant';
import {
    cancelZetaOrderIx,
    closeZetaOpenOrdersIx,
    createATAIx,
    createBotIx,
    depositToZetaIx,
    initZetaMarginAccountIx,
    initZetaOpenOrdersIx,
    placeZetaPerpOrderIx,
    redeemAllAssetsFromBotIx,
    settleZetaMarketIx,
    stopBotIx,
    withdrawFromZetaIx,
} from '../../instruction';
import { PublicKey } from '@solana/web3.js';
import { Market, Orderbook } from '@project-serum/serum';
import Decimal from 'decimal.js';

export class ZetaPerpBot {
    /*
     * returns [botSeed, dexAccountKey, orderOwnerKey, txPayload]
     */
    static async create(params: CreateBotParams): Promise<[Uint8Array, PublicKey, PublicKey, TransactionPayload]> {
        const [botSeed, botKey, botMintKey] = await genValidBotAccount(params.programId);
        const marketConfig = getZetaPerpMarketConfig(params.marketKey) as ZetaPerpMarketConfig;
        const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;

        const cellConfigKey = await getCellConfigAccountKey(params.programId);
        const cellCacheKey = await getCellCacheKey(botKey, params.botOwner, params.programId);

        const ownerUSDCATA = await getATAKey(params.botOwner, SOLANA_TOKEN.USDC.mintKey);
        const ownerBotMintATA = await getATAKey(params.botOwner, botMintKey);
        const botUSDCATA = await getATAKey(botKey, SOLANA_TOKEN.USDC.mintKey);

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
                    mintKey: SOLANA_TOKEN.USDC.mintKey,
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
                    assetPriceKey: SOLANA_TOKEN.USDC.pythPriceKey,
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
        const marketConfig = getZetaPerpMarketConfig(params.marketKey) as ZetaPerpMarketConfig;
        const tokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as TokenConfig;

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
        const marketConfig = getZetaPerpMarketConfig(params.marketKey) as ZetaPerpMarketConfig;

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
        const marketConfig = getZetaPerpMarketConfig(params.marketKey) as ZetaPerpMarketConfig;
        const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;
        const tokenConfig = getTokenConfigBySymbol(marketConfig.baseSymbol) as TokenConfig;

        const zetaMarginAccountKey = await getBotZetaMarginAccountKeyBySeed(
            params.botSeed,
            assetConfig.groupAccount,
            params.programId,
        );
        const zetaMarginAccount = await getZetaMarginAccount(params.connection, zetaMarginAccountKey);

        const position = nativeToUi(new Decimal(zetaMarginAccount.perpProductLedger.position.size.toString()), 3);
        const costOfTrades = nativeToUi(
            new Decimal(zetaMarginAccount.perpProductLedger.position.costOfTrades.toString()),
            6,
        );
        const balance = nativeToUi(new Decimal(zetaMarginAccount.balance.toString()), 6);

        const marketPrice = await getPythPrice(params.connection, tokenConfig.pythPriceKey)
            .then((res) => res as number)
            .then((res) => new Decimal(res));

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

        const marketConfig = getZetaPerpMarketConfig(params.marketKey) as ZetaPerpMarketConfig;
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
                placeZetaPerpOrderIx({
                    botSeed: params.botSeed,
                    price: uiZetaPriceToNative(params.price),
                    size: uiToNative(params.quantity, marketConfig.orderQuantityDecimals),
                    side,
                    orderType,
                    clientOrderId: params.clientId,
                    botAccount: botKey,
                    userOrBotDelegateAccount: params.payer,
                    zetaGroupKey: assetConfig.groupAccount,
                    zetaMarginAccount: zetaMarginAccountKey,
                    zetaGreeksKey: assetConfig.greeksAccount,
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
                    coinWallet: marketConfig.zetaBaseVault,
                    pcWallet: marketConfig.zetaQuoteVault,
                    zetaGroupOracleKey: assetConfig.oracleAccount,
                    zetaMarketMint: side == ZetaOrderSide.Bid ? marketConfig.quoteMint : marketConfig.baseMint,
                    perpSyncQueue: assetConfig.perpSyncQueue,
                    cellConfigAccount: cellConfigAccount,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    static async cancelOrder(params: CancelOrderParams): Promise<TransactionPayload> {
        const side = zetaOrderSideTransform(params.side);

        const marketConfig = getZetaPerpMarketConfig(params.marketKey) as ZetaPerpMarketConfig;
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
     * 1. Close open orders account if existed
     * 2. Redeem all USDC from Zeta
     * 3. Redeem all USDC from bot
     */
    static async close(params: CloseBotParams) {
        const payloads: TransactionPayload[] = [];

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

        const marketConfig = getZetaPerpMarketConfig(params.marketKey) as ZetaPerpMarketConfig;
        const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;

        const cellConfigAccount = await getCellConfigAccountKey(params.programId);
        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const botUSDCATA = await getATAKey(botKey, SOLANA_TOKEN.USDC.mintKey);

        const zetaMarginAccountKey = await getBotZetaMarginAccountKeyBySeed(
            params.botSeed,
            assetConfig.groupAccount,
            params.programId,
        );
        const zetaOpenOrdersAccountKey = await getBotZetaOpenOrdersAccountKey(botKey, params.marketKey);
        const [zetaOpenOrdersMapKey, zetaOpenOrdersMapNonce] = await getZetaOpenOrdersMapKey(zetaOpenOrdersAccountKey);
        const openOrdersAccountInfo = await getSerumOpenOrdersAccountInfo(params.connection, zetaOpenOrdersAccountKey);

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
        }

        if (!botInfo.value.eq(ZERO_DECIMAL)) {
            console.log(`Redeem ${botInfo.value} USDC from DEX`);
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
        }

        // assume Zeta balance redeemed to Bot
        const botUSDCBalance = await getATABalance(params.connection, botUSDCATA).then((res) => res.add(botInfo.value));
        if (!botUSDCBalance.eq(ZERO_DECIMAL)) {
            console.log(`Redeem ${botUSDCBalance} USDC from bot`);
            const redeemAllFromBotPayload: TransactionPayload = { instructions: [], signers: [] };

            const botMintKey = await getBotMintKeyBySeed2(params.botSeed, params.programId);
            const ownerBotMintATA = await getATAKey(params.owner, botMintKey);

            const botAssetKeys: PublicKey[] = [];
            const userAssetKeys: PublicKey[] = [];
            const cellAssetKeys: PublicKey[] = [];
            const assetPriceKeys: PublicKey[] = [];
            const referrerAssetKeys: PublicKey[] = [];

            // USDC
            botAssetKeys.push(botUSDCATA);

            const [ownerUSDCATA, createOwnerUSDCATAIx] = await createATA(
                params.connection,
                params.owner,
                SOLANA_TOKEN.USDC.mintKey,
                params.owner,
            );
            userAssetKeys.push(ownerUSDCATA);
            if (createOwnerUSDCATAIx) {
                redeemAllFromBotPayload.instructions.push(createOwnerUSDCATAIx);
            }

            const [cellUSDCATA, createCellUSDCATAIx] = await createATA(
                params.connection,
                ADMIN_ACCOUNT,
                SOLANA_TOKEN.USDC.mintKey,
                params.owner,
            );
            cellAssetKeys.push(cellUSDCATA);
            if (createCellUSDCATAIx) {
                redeemAllFromBotPayload.instructions.push(createCellUSDCATAIx);
            }

            assetPriceKeys.push(SOLANA_TOKEN.USDC.pythPriceKey);

            if (!params.referrer.equals(PublicKey.default)) {
                const [referrerUSDCATA, createReferrerUSDCATAIx] = await createATA(
                    params.connection,
                    params.referrer,
                    SOLANA_TOKEN.USDC.mintKey,
                    params.owner,
                );
                referrerAssetKeys.push(referrerUSDCATA);
                if (createReferrerUSDCATAIx) {
                    redeemAllFromBotPayload.instructions.push(createReferrerUSDCATAIx);
                }
            }

            redeemAllFromBotPayload.instructions.push(
                redeemAllAssetsFromBotIx({
                    botSeed: params.botSeed,
                    botKey,
                    botMintKey,
                    userBotTokenKey: ownerBotMintATA,
                    userKey: params.owner,
                    referrerKey: params.referrer,
                    botAssetKeys,
                    userAssetKeys,
                    cellAssetKeys,
                    assetPriceKeys,
                    cellConfigKey: cellConfigAccount,
                    referrerAssetKeys,
                    programId: params.programId,
                }),
            );
            payloads.push(redeemAllFromBotPayload);
        }
        return payloads;
    }
}
