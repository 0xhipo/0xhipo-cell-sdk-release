import {
    AdjustPoolReserveParams,
    DepositPoolParams,
    GetPoolInfoParams,
    ModifyPoolOrderParams,
    PoolInfo,
    RedeemPoolParams,
    SolanaTokenConfig,
    TransactionPayload,
    ZetaAssetConfig,
    ZetaFutureMarketConfig,
    ZetaOrderSide,
} from '../../type';
import {
    createATA,
    getATABalance,
    getATAKey,
    getBotKeyBySeed,
    getBotMintKeyBySeed2,
    getBotZetaMarginAccountKeyBySeed,
    getBotZetaOpenOrdersAccountKey,
    getCellCacheKey,
    getCellConfigAccountKey,
    getTokenConfigBySymbol,
    getZetaAssetConfigBySymbol,
    getZetaFutureMarketConfig,
    Numberu128,
    uiToNative,
    uiZetaPriceToNative,
    zetaOrderSideTransform,
    zetaOrderTypeTransform,
} from '../../util';
import {
    cancelZetaOrderIx,
    placeZetaOrderIx,
    zetaPoolAdjustReserveIx,
    zetaPoolDepositIx,
    zetaPoolWithdrawIx,
} from '../../instruction';
import { ZetaFutureBot } from '../../Bot/solana/ZetaFutureBot';

export class ZetaFuturePool {
    /*
     * returns [botSeed, dexAccountKey, orderOwnerKey, txPayload]
     */
    // static async create(params: CreateBotParams): Promise<[Uint8Array, PublicKey, PublicKey, TransactionPayload]> {
    //     const [botSeed, botKey, botMintKey] = await genValidBotAccount(params.programId);
    //     const marketConfig = getZetaFutureMarketConfig(params.marketKey) as ZetaFutureMarketConfig;
    //     const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;
    //     const usdcConfig = getTokenConfigBySymbol('USDC') as SolanaTokenConfig;
    //
    //     const cellConfigKey = await getCellConfigAccountKey(params.programId);
    //     const cellCacheKey = await getCellCacheKey(botKey, params.botOwner, params.programId);
    //
    //     const ownerUSDCATA = await getATAKey(params.botOwner, usdcConfig.mintKey);
    //     const ownerBotMintATA = await getATAKey(params.botOwner, botMintKey);
    //     const botUSDCATA = await getATAKey(botKey, usdcConfig.mintKey);
    //
    //     const dexAccountKey = await getBotZetaMarginAccountKeyBySeed(
    //         botSeed,
    //         assetConfig.groupAccount,
    //         params.programId,
    //     );
    //     const orderOwnerKey = await getBotZetaOpenOrdersAccountKey(botKey, params.marketKey);
    //     const zetaOpenOrdersMapKey = await getZetaOpenOrdersMapKey(orderOwnerKey).then((res) => res[0]);
    //
    //     const payload: TransactionPayload = {
    //         instructions: [
    //             createATAIx({
    //                 ataKey: botUSDCATA,
    //                 ownerKey: botKey,
    //                 mintKey: usdcConfig.mintKey,
    //                 payerKey: params.botOwner,
    //             }),
    //             createBotIx({
    //                 botSeed,
    //                 depositAssetQuantity: uiToNative(params.depositAssetQuantity, 6),
    //                 lowerPrice: uiToNative(params.lowerPrice, 6),
    //                 upperPrice: uiToNative(params.upperPrice, 6),
    //                 gridNum: params.gridNum,
    //                 marketKey: params.marketKey,
    //                 leverage: uiToNative(params.leverage, 2),
    //                 botKey,
    //                 botMintKey,
    //                 botAssetKey: botUSDCATA,
    //                 userAssetKey: ownerUSDCATA,
    //                 userBotTokenKey: ownerBotMintATA,
    //                 assetPriceKey: usdcConfig.pythPriceKey,
    //                 userKey: params.botOwner,
    //                 protocol: params.protocol,
    //                 botType: params.botType,
    //                 stopTopRatio: params.stopTopRatio,
    //                 stopBottomRatio: params.stopBottomRatio,
    //                 trigger: params.trigger,
    //                 isPool: true,
    //                 startPrice: uiToNative(params.startPrice, 6),
    //                 cellCacheAccount: cellCacheKey,
    //                 programId: params.programId,
    //             }),
    //             initZetaMarginAccountIx({
    //                 botSeed,
    //                 botAccount: botKey,
    //                 userOrBotDelegateAccount: params.botOwner,
    //                 zetaMarginAccount: dexAccountKey,
    //                 zetaAccountOwnerAccount: botKey,
    //                 cellConfigAccount: cellConfigKey,
    //                 zetaGroupKey: assetConfig.groupAccount,
    //                 programId: params.programId,
    //             }),
    //             initZetaOpenOrdersIx({
    //                 botSeed,
    //                 botAccount: botKey,
    //                 userOrBotDelegateAccount: params.botOwner,
    //                 openOrdersAccount: orderOwnerKey,
    //                 zetaMarginAccount: dexAccountKey,
    //                 marketAccount: params.marketKey,
    //                 openOrdersMapAccount: zetaOpenOrdersMapKey,
    //                 cellConfigAccount: cellConfigKey,
    //                 zetaGroupKey: assetConfig.groupAccount,
    //                 programId: params.programId,
    //             }),
    //             depositToZetaIx({
    //                 botSeed,
    //                 amount: uiToNative(params.depositAssetQuantity, 6),
    //                 botAccount: botKey,
    //                 userOrBotDelegateAccount: params.botOwner,
    //                 zetaMarginAccount: dexAccountKey,
    //                 botTokenAccount: botUSDCATA,
    //                 cellConfigAccount: cellConfigKey,
    //                 zetaGroupKey: assetConfig.groupAccount,
    //                 zetaVaultKey: assetConfig.vaultAccount,
    //                 zetaGreeksKey: assetConfig.greeksAccount,
    //                 zetaSocializedLossKey: assetConfig.socializedLossAccount,
    //                 programId: params.programId,
    //             }),
    //         ],
    //         signers: [],
    //     };
    //
    //     return [botSeed, dexAccountKey, orderOwnerKey, payload];
    // }

    static async deposit(params: DepositPoolParams): Promise<TransactionPayload> {
        const payload: TransactionPayload = { instructions: [], signers: [] };

        const marketConfig = getZetaFutureMarketConfig(params.marketKey) as ZetaFutureMarketConfig;
        const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;
        const usdcConfig = getTokenConfigBySymbol('USDC') as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const botMintKey = await getBotMintKeyBySeed2(params.botSeed, params.programId);
        const cellCacheKey = await getCellCacheKey(botKey, params.investor, params.programId);
        const botUSDCATA = await getATAKey(botKey, usdcConfig.mintKey);
        const investorUSDCATA = await getATAKey(params.investor, usdcConfig.mintKey);
        const [investorBotMintATA, createInvestorBotMintATAIx] = await createATA(
            params.connection,
            params.investor,
            botMintKey,
            params.investor,
        );
        if (createInvestorBotMintATAIx) {
            payload.instructions.push(createInvestorBotMintATAIx);
        }

        const zetaMarginAccountKey = await getBotZetaMarginAccountKeyBySeed(
            params.botSeed,
            assetConfig.groupAccount,
            params.programId,
        );

        payload.instructions.push(
            zetaPoolDepositIx({
                botSeed: params.botSeed,
                amount: uiToNative(params.amount, 6),
                botAccount: botKey,
                botMintAccount: botMintKey,
                investorAccount: params.investor,
                investorAssetAccount: investorUSDCATA,
                investorBotTokenAccount: investorBotMintATA,
                botAssetAccount: botUSDCATA,
                cellCacheAccount: cellCacheKey,
                zetaMarginAccount: zetaMarginAccountKey,
                zetaGreeksAccount: assetConfig.greeksAccount,
                zetaGroupAccount: assetConfig.groupAccount,
                pythPriceAccount: usdcConfig.pythPriceKey,
                programId: params.programId,
            }),
        );

        return payload;
    }

    static async redeem(params: RedeemPoolParams): Promise<TransactionPayload> {
        const marketConfig = getZetaFutureMarketConfig(params.marketKey) as ZetaFutureMarketConfig;
        const assetConfig = getZetaAssetConfigBySymbol(marketConfig.baseSymbol) as ZetaAssetConfig;
        const usdcConfig = getTokenConfigBySymbol('USDC') as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const botMintKey = await getBotMintKeyBySeed2(params.botSeed, params.programId);
        const investorBotMintATA = await getATAKey(params.investor, botMintKey);

        const cellCacheKey = await getCellCacheKey(botKey, params.investor, params.programId);
        const cellConfigAccount = await getCellConfigAccountKey(params.programId);

        const botUSDCATA = await getATAKey(botKey, usdcConfig.mintKey);
        const investorUSDCATA = await getATAKey(params.investor, usdcConfig.mintKey);
        const botOwnerUSDCATA = await getATAKey(params.botOwner, usdcConfig.mintKey);
        const cellUSDCATA = await getATAKey(params.cellAdmin, usdcConfig.mintKey);

        const zetaMarginAccountKey = await getBotZetaMarginAccountKeyBySeed(
            params.botSeed,
            assetConfig.groupAccount,
            params.programId,
        );

        return {
            signers: [],
            instructions: [
                zetaPoolWithdrawIx({
                    botSeed: params.botSeed,
                    amount: uiToNative(params.amount, 6),
                    botAccount: botKey,
                    botMintAccount: botMintKey,
                    investorAccount: params.investor,
                    investorAssetAccount: investorUSDCATA,
                    investorBotTokenAccount: investorBotMintATA,
                    botAssetAccount: botUSDCATA,
                    cellCacheAccount: cellCacheKey,
                    cellConfigAccount: cellConfigAccount,
                    cellAssetAccount: cellUSDCATA,
                    zetaMarginAccount: zetaMarginAccountKey,
                    zetaGreeksAccount: assetConfig.greeksAccount,
                    zetaGroupAccount: assetConfig.groupAccount,
                    pythPriceAccount: usdcConfig.pythPriceKey,
                    botOwnerAssetAccount: botOwnerUSDCATA,
                    programId: params.programId,
                }),
            ],
        };
    }

    static async adjustReserve(params: AdjustPoolReserveParams): Promise<TransactionPayload> {
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
        return {
            signers: [],
            instructions: [
                zetaPoolAdjustReserveIx({
                    botSeed: params.botSeed,
                    botAccount: botKey,
                    zetaGroupAccount: assetConfig.groupAccount,
                    zetaVaultAccount: assetConfig.vaultAccount,
                    zetaMarginAccount: zetaMarginAccountKey,
                    botAssetTokenAccount: botUSDCATA,
                    zetaGreeksAccount: assetConfig.greeksAccount,
                    zetaOracleAccount: assetConfig.oracleAccount,
                    zetaSocializedLossAccount: assetConfig.socializedLossAccount,
                    userOrBotDelegateAccount: params.payer,
                    cellConfigAccount,
                    pythPriceAccount: usdcConfig.pythPriceKey,
                    programId: params.programId,
                }),
            ],
        };
    }

    static async getPoolInfo(params: GetPoolInfoParams): Promise<PoolInfo> {
        const usdcConfig = getTokenConfigBySymbol('USDC') as SolanaTokenConfig;

        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const botUSDCATA = await getATAKey(botKey, usdcConfig.mintKey);
        const botUSDCBalance = await getATABalance(params.connection, botUSDCATA);

        const botInfo = await ZetaFutureBot.getBotInfo({
            protocol: params.protocol,
            connection: params.connection,
            botSeed: params.botSeed,
            marketKey: params.marketKey,
            programId: params.programId,
        });
        return {
            botValue: botUSDCBalance,
            dexValue: botInfo.value,
            position: botInfo.position,
        };
    }

    static async modifyOrder(params: ModifyPoolOrderParams): Promise<TransactionPayload> {
        const zetaExistedOrderSide = zetaOrderSideTransform(params.existedOrderSide);
        const zetaNewOrderSide = zetaOrderSideTransform(params.newOrderSide);
        const zetaNewOrderType = zetaOrderTypeTransform(params.newOrderType);

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
                    side: zetaExistedOrderSide,
                    orderId: new Numberu128(params.existedOrderId),
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
                placeZetaOrderIx({
                    botSeed: params.botSeed,
                    price: uiZetaPriceToNative(params.newOrderPrice),
                    size: uiToNative(params.newOrderSize, marketConfig.orderQuantityDecimals),
                    side: zetaNewOrderSide,
                    orderType: zetaNewOrderType,
                    clientOrderId: params.newOrderClientId,
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
                        zetaNewOrderSide == ZetaOrderSide.Bid
                            ? marketConfig.zetaQuoteVault
                            : marketConfig.zetaBaseVault,
                    coinVault: marketConfig.baseVault,
                    pcVault: marketConfig.quoteVault,
                    pcWallet: marketConfig.zetaQuoteVault,
                    coinWallet: marketConfig.zetaBaseVault,
                    zetaMarketNode: marketConfig.greekNodeKey,
                    zetaMarketMint:
                        zetaNewOrderSide == ZetaOrderSide.Bid ? marketConfig.quoteMint : marketConfig.baseMint,
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
}
