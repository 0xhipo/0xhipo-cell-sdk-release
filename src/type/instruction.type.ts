import { PublicKey } from '@solana/web3.js';
import { Numberu128 } from '../util';
import { SerumOrderType, ZetaOrderSide, ZetaOrderType } from '../type';
import { BotType, OrderSide, Protocol } from './bot.type';
import Decimal from 'decimal.js';

export enum InstructionIndex {
    CreateBot = 0,
    RedeemAllAssetsFromBot = 1,
    StartBot = 2,
    StopBot = 3,
    DepositToMango = 5,
    WithdrawFromMango = 6,
    PlaceMangoPerpOrder = 7,
    CancelMangoPerpOrder = 8,
    CancelAllMangoPerpOrders = 9,
    CloseMangoPerpMarket = 10,
    RedeemMNGOReward = 11,
    CreateCellConfigAccount = 12,
    SetCellFee = 13,
    SetCellConfigDelegate = 14,
    UpdateBotInfo = 15,
    InitZetaMarginAccount = 16,
    DepositToZeta = 17,
    WithdrawFromZeta = 18,
    InitZetaOpenOrders = 19,
    PlaceZetaOrder = 20,
    CancelZetaOrder = 21,
    CreateMangoAccount = 22,
    Deposit = 26,
    Withdraw = 27,
    SetCellConfigReserveInfo = 28,
    SetBotGridInfo = 29,
    CreateMangoSpotOpenOrders = 30,
    PlaceMangoSpotOrder = 31,
    MangoSettleFunds = 32,
    CancelMangoSpotOrder = 33,
    CancelAllMangoSpotOrders = 34,
    RemoveMangoSpotAsset = 35,
    CloseMangoSpotOpenOrders = 36,
    ModifyMangoPerpOrder = 37,
    ModifyMangoSpotOrder = 38,
    CloseZetaOpenOrders = 39,
    SetPoolWithdrawOnly = 40,
    ResolveMangoDust = 41,
    CloseMangoAccount = 42,
    CellConfigRealloc = 46,
    AdjustReserveRatio = 47,
    SetCellConfig = 48,
    UpgradeBotInfo = 49,
    UpgradeBotInfo2 = 50,
    SetBotReferrerKey = 51,
    MangoReimbursement = 52,
    CreateReimbursementAccount = 53,
    ZetaPoolDeposit = 54,
    ZetaPoolWithdraw = 55,
    ZetaPoolAdjustReserve = 56,
    PlaceZetaPerpOrder = 57,
    SerumPlaceOrder = 100,
    SerumSettleFunds = 101,
    SerumCancelOrder = 102,
    SerumInitOpenOrders = 103,
    SerumCloseOpenOrders = 104,
    SerumPoolDeposit = 105,
    SerumPoolWithdraw = 106,
    SerumPoolAdjustReserve = 107,
}

export interface CreateBotIxParams {
    botSeed: Uint8Array;
    depositBaseBalance: Decimal;
    depositQuoteBalance: Decimal;
    lowerPrice: Decimal;
    upperPrice: Decimal;
    gridNum: Decimal;
    marketKey: PublicKey;
    leverage: Decimal;
    botKey: PublicKey;
    botMintKey: PublicKey;
    userBotTokenKey: PublicKey;
    userKey: PublicKey;
    botType: BotType;
    protocol: Protocol;
    stopTopRatio: Decimal;
    stopBottomRatio: Decimal;
    trigger: boolean;
    isPool: boolean;
    startPrice: Decimal;
    isDualDeposit: boolean;
    cellCacheAccount: PublicKey;
    botAssetKeys: PublicKey[];
    userAssetKeys: PublicKey[];
    assetPriceKeys: PublicKey[];
    programId: PublicKey;
}

export interface RedeemAllAssetsFromBotIxParams {
    botSeed: Uint8Array;
    botKey: PublicKey;
    botMintKey: PublicKey;
    userBotTokenKey: PublicKey;
    userKey: PublicKey;
    referrerKey: PublicKey;
    programId: PublicKey;
    cellConfigKey: PublicKey;
    botAssetKeys: PublicKey[];
    userAssetKeys: PublicKey[];
    cellAssetKeys: PublicKey[];
    assetPriceKeys: PublicKey[];
    referrerAssetKeys: PublicKey[];
}

export interface StartBotIxParams {
    botSeed: Uint8Array;
    botKey: PublicKey;
    userKey: PublicKey;
    programId: PublicKey;
}

export interface StopBotIxParams {
    botSeed: Uint8Array;
    botKey: PublicKey;
    userKey: PublicKey;
    pythPriceAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface DepositToMangoIxParams {
    botSeed: Uint8Array;
    depositQuantity: number;
    botKey: PublicKey;
    mangoAccountKey: PublicKey;
    rootBankKey: PublicKey;
    nodeBankKey: PublicKey;
    vaultAccount: PublicKey;
    botAssetKey: PublicKey;
    userKey: PublicKey;
    cellConfigKey: PublicKey;
    userOrDelegateKey: PublicKey;
    openOrdersAccounts: PublicKey[];
    usdcPythPriceAccount: PublicKey;
    programId: PublicKey;
}

export interface WithdrawFromMangoIxParams {
    botSeed: Uint8Array;
    withdrawQuantity: number | string;
    allowBorrow: number;
    botKey: PublicKey;
    botAssetKey: PublicKey;
    userOrDelegateKey: PublicKey;
    mangoAccountKey: PublicKey;
    rootBankKey: PublicKey;
    nodeBankKey: PublicKey;
    vaultAccount: PublicKey;
    cellConfigKey: PublicKey;
    mangoGroupSignerKey: PublicKey;
    openOrdersKeys: PublicKey[];
    usdcPythPriceAccount: PublicKey;
    programId: PublicKey;
}

export interface CancelMangoPerpOrderIxParams {
    botSeed: Uint8Array;
    orderId: Numberu128;
    invalidIdOk: number;
    botKey: PublicKey;
    userOrDelegateKey: PublicKey;
    mangoAccountKey: PublicKey;
    perpMarketKey: PublicKey;
    bidsKey: PublicKey;
    asksKey: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface CancelAllMangoPerpOrdersIxParams {
    botSeed: Uint8Array;
    limit: number;
    botKey: PublicKey;
    userOrDelegateKey: PublicKey;
    mangoAccountKey: PublicKey;
    perpMarketKey: PublicKey;
    bidsKey: PublicKey;
    asksKey: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface RedeemMNGORewardIxParams {
    botSeed: Uint8Array;
    botKey: PublicKey;
    userOrDelegateKey: PublicKey;
    mangoAccountKey: PublicKey;
    perpMarketKey: PublicKey;
    mangoPerpVaultKey: PublicKey;
    rootBankKey: PublicKey;
    nodeBankKey: PublicKey;
    mangoBankVaultKey: PublicKey;
    mangoGroupSignerKey: PublicKey;
    programId: PublicKey;
}

export interface CreateCellConfigAccountIxParams {
    adminAccount: PublicKey;
    payerAccount: PublicKey;
    cellConfigKey: PublicKey;
    programId: PublicKey;
}

export interface SetCellFeeIxParams {
    feePercent: number;
    cellConfigAccount: PublicKey;
    adminOrDelegateAccount: PublicKey;
    programId: PublicKey;
}

export interface SetCellConfigDelegateIxParams {
    cellConfigAccount: PublicKey;
    delegateAccount: PublicKey;
    adminAccount: PublicKey;
    programId: PublicKey;
}

export interface CreateMangoAccountIxParams {
    botSeed: Uint8Array;
    accountNumber: number;
    botKey: PublicKey;
    mangoAccountKey: PublicKey;
    userKey: PublicKey;
    programId: PublicKey;
}

export interface InitZetaMarginAccountIxParams {
    botSeed: Uint8Array;
    botAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    zetaMarginAccount: PublicKey;
    zetaAccountOwnerAccount: PublicKey;
    cellConfigAccount: PublicKey;
    zetaGroupKey: PublicKey;
    programId: PublicKey;
}

export interface createATAIxParams {
    ataKey: PublicKey;
    ownerKey: PublicKey;
    mintKey: PublicKey;
    payerKey: PublicKey;
}

export interface DepositToZetaIxParams {
    botSeed: Uint8Array;
    amount: Decimal;
    botAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    zetaMarginAccount: PublicKey;
    botTokenAccount: PublicKey;
    cellConfigAccount: PublicKey;
    zetaGroupKey: PublicKey;
    zetaVaultKey: PublicKey;
    zetaGreeksKey: PublicKey;
    zetaSocializedLossKey: PublicKey;
    programId: PublicKey;
}

export interface WithdrawFromZetaIxParams {
    botSeed: Uint8Array;
    amount: Decimal;
    botAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    zetaMarginAccount: PublicKey;
    botTokenAccount: PublicKey;
    cellConfigAccount: PublicKey;
    zetaGroupKey: PublicKey;
    zetaGroupOracleKey: PublicKey;
    zetaVaultKey: PublicKey;
    zetaGreeksKey: PublicKey;
    zetaSocializedLossKey: PublicKey;
    programId: PublicKey;
}

export interface InitZetaOpenOrdersIxParams {
    botSeed: Uint8Array;
    botAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    openOrdersAccount: PublicKey;
    zetaMarginAccount: PublicKey;
    marketAccount: PublicKey;
    openOrdersMapAccount: PublicKey;
    cellConfigAccount: PublicKey;
    zetaGroupKey: PublicKey;
    programId: PublicKey;
}

export interface PlaceZetaOrderIxParams {
    botSeed: Uint8Array;
    price: Decimal;
    size: Decimal;
    side: ZetaOrderSide;
    orderType: ZetaOrderType;
    clientOrderId: string;
    botAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    zetaMarginAccount: PublicKey;
    openOrdersAccount: PublicKey;
    marketAccount: PublicKey;
    requestQueueAccount: PublicKey;
    eventQueueAccount: PublicKey;
    bidsAccount: PublicKey;
    asksAccount: PublicKey;
    orderPayerTokenAccount: PublicKey;
    coinVault: PublicKey;
    pcVault: PublicKey;
    pcWallet: PublicKey;
    coinWallet: PublicKey;
    zetaMarketNode: PublicKey;
    zetaMarketMint: PublicKey;
    cellConfigAccount: PublicKey;
    zetaGroupKey: PublicKey;
    zetaGroupOracleKey: PublicKey;
    zetaGreeksKey: PublicKey;
    programId: PublicKey;
}

export interface CancelZetaOrderIxParams {
    botSeed: Uint8Array;
    side: ZetaOrderSide;
    orderId: Numberu128;
    botAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    zetaMarginAccount: PublicKey;
    openOrdersAccount: PublicKey;
    marketAccount: PublicKey;
    bidsAccount: PublicKey;
    asksAccount: PublicKey;
    eventQueueAccount: PublicKey;
    cellConfigAccount: PublicKey;
    zetaGroupKey: PublicKey;
    programId: PublicKey;
}

export interface CloseZetaOpenOrdersIxParams {
    botSeed: Uint8Array;
    botAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    zetaMarginAccount: PublicKey;
    openOrdersAccount: PublicKey;
    openOrdersMapNonce: number;
    marketAccount: PublicKey;
    openOrdersMapAccount: PublicKey;
    cellConfigAccount: PublicKey;
    userKey: PublicKey;
    zetaGroupKey: PublicKey;
    programId: PublicKey;
}

export interface CreateMangoSpotOpenOrdersIxParams {
    botSeed: Uint8Array;
    mangoAccount: PublicKey;
    botAccount: PublicKey;
    openOrdersAccount: PublicKey;
    spotMarketAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface MangoSettleFundsIxParams {
    botSeed: Uint8Array;
    userOrBotDelegateAccount: PublicKey;
    mangoAccount: PublicKey;
    botAccount: PublicKey;
    openOrdersAccount: PublicKey;
    spotMarketAccount: PublicKey;
    baseAccount: PublicKey;
    quoteAccount: PublicKey;
    baseRootBankAccount: PublicKey;
    baseNodeBankAccount: PublicKey;
    baseVaultAccount: PublicKey;
    quoteRootBankAccount: PublicKey;
    quoteNodeBankAccount: PublicKey;
    quoteVaultAccount: PublicKey;
    serumSignerAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface CancelMangoSpotOrderIxParams {
    botSeed: Uint8Array;
    side: OrderSide;
    orderId: Numberu128;
    userOrBotDelegateAccount: PublicKey;
    mangoAccount: PublicKey;
    botAccount: PublicKey;
    spotMarketAccount: PublicKey;
    bidsAccount: PublicKey;
    asksAccount: PublicKey;
    eventQueueAccount: PublicKey;
    mangoSignerAccount: PublicKey;
    openOrdersAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface CancelAllMangoSpotOrdersIxParams {
    botSeed: Uint8Array;
    limit: number;
    userOrBotDelegateAccount: PublicKey;
    mangoAccount: PublicKey;
    botAccount: PublicKey;
    spotMarketAccount: PublicKey;
    bidsAccount: PublicKey;
    asksAccount: PublicKey;
    openOrdersAccount: PublicKey;
    eventQueueAccount: PublicKey;
    baseAccount: PublicKey;
    quoteAccount: PublicKey;
    baseRootBankAccount: PublicKey;
    baseNodeBankAccount: PublicKey;
    baseVaultAccount: PublicKey;
    quoteRootBankAccount: PublicKey;
    quoteNodeBankAccount: PublicKey;
    quoteVaultAccount: PublicKey;
    mangoSignerAccount: PublicKey;
    serumSignerAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface RemoveMangoSpotAssetIxParams {
    botSeed: Uint8Array;
    marketIndex: number;
    coinLotSize: number;
    pcLotSize: number;
    userOrDelegateKey: PublicKey;
    mangoAccount: PublicKey;
    botAccount: PublicKey;
    spotMarketAccount: PublicKey;
    bidsAccount: PublicKey;
    asksAccount: PublicKey;
    requestQueueAccount: PublicKey;
    eventQueueAccount: PublicKey;
    baseAccount: PublicKey;
    quoteAccount: PublicKey;
    baseRootBankAccount: PublicKey;
    baseNodeBankAccount: PublicKey;
    baseVaultAccount: PublicKey;
    quoteRootBankAccount: PublicKey;
    quoteNodeBankAccount: PublicKey;
    quoteVaultAccount: PublicKey;
    serumSignerAccount: PublicKey;
    msrmOrSrmVaultAccount: PublicKey;
    openOrdersAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface CloseMangoSpotOpenOrdersIxParams {
    botSeed: Uint8Array;
    mangoAccount: PublicKey;
    botAccount: PublicKey;
    openOrdersAccount: PublicKey;
    spotMarketAccount: PublicKey;
    userKey: PublicKey;
    programId: PublicKey;
}

export interface SettleZetaMarketIxParams {
    marketKey: PublicKey;
    baseVault: PublicKey;
    quoteVault: PublicKey;
    dexBaseVault: PublicKey;
    dexQuoteVault: PublicKey;
    vaultOwner: PublicKey;
    openOrdersAccount: PublicKey;
}

export interface UpdateBotInfoIxParams {
    botSeed: Uint8Array;
    botType: BotType;
    stopTopRatio: number;
    stopBottomRatio: number;
    trigger: number;
    botAccount: PublicKey;
    delegateAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface DepositIxParams {
    botSeed: Uint8Array;
    depositAmount: number;
    botKey: PublicKey;
    botMintKey: PublicKey;
    investorKey: PublicKey;
    investorAssetKey: PublicKey;
    investorBotTokenKey: PublicKey;
    botAssetKey: PublicKey;
    cellCacheKey: PublicKey;
    mangoAccountKey: PublicKey;
    usdcPythPriceAccount: PublicKey;
    openOrdersAccounts: PublicKey[];
    programId: PublicKey;
}

export interface WithdrawIxParams {
    botSeed: Uint8Array;
    withdrawBotTokenAmount: number;
    botKey: PublicKey;
    botMintKey: PublicKey;
    investorKey: PublicKey;
    investorAssetKey: PublicKey;
    investorBotTokenKey: PublicKey;
    botAssetKey: PublicKey;
    cellCacheKey: PublicKey;
    cellAssetKey: PublicKey;
    mangoAccountKey: PublicKey;
    cellConfigKey: PublicKey;
    usdcPythPriceAccount: PublicKey;
    botOwnerAssetAccount: PublicKey;
    openOrdersAccounts: PublicKey[];
    programId: PublicKey;
}

export interface SetCellConfigReserveInfoIxParams {
    reserveRatio: number;
    reserveFreq: number;
    cellConfigAccount: PublicKey;
    adminOrDelegateAccount: PublicKey;
    programId: PublicKey;
}

export interface SetBotGridInfoIxParams {
    amountToTrade: number;
    upperPrice: number;
    lowerPrice: number;
    gridNum: number;
    botAccount: PublicKey;
    userOrDelegateAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface SetPoolWithdrawOnlyIxParams {
    botSeed: Uint8Array;
    botAccount: PublicKey;
    delegateAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface ResolveMangoDustIxParams {
    botSeed: Uint8Array;
    botAccount: PublicKey;
    mangoAccount: PublicKey;
    mangoRootBankAccount: PublicKey;
    mangoNodeBankAccount: PublicKey;
    mangoDustAccount: PublicKey;
    userAccount: PublicKey;
    programId: PublicKey;
}

export interface CloseMangoAccountIxParams {
    botSeed: Uint8Array;
    botAccount: PublicKey;
    mangoAccount: PublicKey;
    userAccount: PublicKey;
    programId: PublicKey;
}

export interface AdjustPoolReserveIxParams {
    botSeed: Uint8Array;
    botAccount: PublicKey;
    botAssetAccount: PublicKey;
    mangoAccount: PublicKey;
    rootBankAccount: PublicKey;
    nodeBankAccount: PublicKey;
    vaultAccount: PublicKey;
    userOrDelegateAccount: PublicKey;
    cellConfigAccount: PublicKey;
    usdcPythPriceAccount: PublicKey;
    openOrdersAccounts: PublicKey[];
    programId: PublicKey;
}

export interface SetCellConfigIxParams {
    delegate: PublicKey;
    createBotLine: number;
    stopBotLine: number;
    reserveFreq: number;
    reserveRatio: number;
    performanceFeeRatio: number;
    botOwnerMostPerformanceFeeRatio: number;
    cellConfigAccount: PublicKey;
    adminAccount: PublicKey;
    performanceFeeDiscount: number;
    referrerPerformanceFeeRatio: number;
    programId: PublicKey;
}

export interface CellConfigReallocIxParams {
    addSize: number;
    cellConfigAccount: PublicKey;
    adminAccount: PublicKey;
    programId: PublicKey;
}

export interface UpgradeBotInfoIxParams {
    botSeed: Uint8Array;
    botKey: PublicKey;
    payerKey: PublicKey;
    programId: PublicKey;
}

export interface UpgradeBotInfo2IxParams {
    botSeed: Uint8Array;
    upperPrice: number;
    lowerPrice: number;
    startPrice: number;
    botKey: PublicKey;
    programId: PublicKey;
}

export interface SetBotReferrerkeyIxParams {
    botSeed: Uint8Array;
    referrerKey: PublicKey;
    botKey: PublicKey;
    userKey: PublicKey;
    programId: PublicKey;
}

export interface MangoReimbursementIxParams {
    botSeed: Uint8Array;
    tokenIndex: number;
    indexIntoTable: number;
    vaultAccount: PublicKey;
    tokenAccount: PublicKey;
    reimbursementAccount: PublicKey;
    mangoAccountOwnerAccount: PublicKey;
    botAccount: PublicKey;
    claimMintTokenAccount: PublicKey;
    claimMintAccount: PublicKey;
    reimbursementTableAccount: PublicKey;
    programId: PublicKey;
}

export interface MangoCreateReimbursementAccountIxParams {
    botSeed: Uint8Array;
    reimbursementAccount: PublicKey;
    mangoAccountOwnerAccount: PublicKey;
    payer: PublicKey;
    programId: PublicKey;
}

export interface PlaceZetaPerpOrderIxParams {
    botSeed: Uint8Array;
    price: Decimal;
    size: Decimal;
    side: ZetaOrderSide;
    orderType: ZetaOrderType;
    clientOrderId: string;
    botAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    zetaGroupKey: PublicKey;
    zetaMarginAccount: PublicKey;
    zetaGreeksKey: PublicKey;
    openOrdersAccount: PublicKey;
    marketAccount: PublicKey;
    requestQueueAccount: PublicKey;
    eventQueueAccount: PublicKey;
    bidsAccount: PublicKey;
    asksAccount: PublicKey;
    orderPayerTokenAccount: PublicKey;
    coinVault: PublicKey;
    pcVault: PublicKey;
    coinWallet: PublicKey;
    pcWallet: PublicKey;
    zetaGroupOracleKey: PublicKey;
    zetaMarketMint: PublicKey;
    perpSyncQueue: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface ZetaPoolDepositIxParams {
    botSeed: Uint8Array;
    amount: Decimal;
    botAccount: PublicKey;
    botMintAccount: PublicKey;
    investorAccount: PublicKey;
    investorAssetAccount: PublicKey;
    investorBotTokenAccount: PublicKey;
    botAssetAccount: PublicKey;
    cellCacheAccount: PublicKey;
    zetaMarginAccount: PublicKey;
    zetaGreeksAccount: PublicKey;
    zetaGroupAccount: PublicKey;
    pythPriceAccount: PublicKey;
    programId: PublicKey;
}

export interface ZetaPoolWithdrawIxParams {
    botSeed: Uint8Array;
    amount: Decimal;
    botAccount: PublicKey;
    botMintAccount: PublicKey;
    investorAccount: PublicKey;
    investorAssetAccount: PublicKey;
    investorBotTokenAccount: PublicKey;
    botAssetAccount: PublicKey;
    cellCacheAccount: PublicKey;
    cellConfigAccount: PublicKey;
    cellAssetAccount: PublicKey;
    zetaMarginAccount: PublicKey;
    zetaGreeksAccount: PublicKey;
    zetaGroupAccount: PublicKey;
    pythPriceAccount: PublicKey;
    botOwnerAssetAccount: PublicKey;
    programId: PublicKey;
}

export interface ZetaPoolAdjustReserveIxParams {
    botSeed: Uint8Array;
    botAccount: PublicKey;
    zetaGroupAccount: PublicKey;
    zetaVaultAccount: PublicKey;
    zetaMarginAccount: PublicKey;
    botAssetTokenAccount: PublicKey;
    zetaGreeksAccount: PublicKey;
    zetaOracleAccount: PublicKey;
    zetaSocializedLossAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    cellConfigAccount: PublicKey;
    pythPriceAccount: PublicKey;
    programId: PublicKey;
}

export interface SerumPlaceOrderIxParams {
    botSeed: Uint8Array;
    side: OrderSide;
    orderType: SerumOrderType;
    limitPrice: Decimal;
    amountToTrade: Decimal;
    coinLotSize: number;
    pcLotSize: number;
    clientOrderId: string;
    userOrBotDelegateAccount: PublicKey;
    marketAccount: PublicKey;
    openOrdersAccount: PublicKey;
    requestQueueAccount: PublicKey;
    eventQueueAccount: PublicKey;
    bidsAccount: PublicKey;
    asksAccount: PublicKey;
    botOrWorkingCapAssetAccount: PublicKey;
    botOrWorkingCapAccount: PublicKey;
    botAccount: PublicKey;
    coinVault: PublicKey;
    pcVault: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface SerumSettleFundsIxParams {
    botSeed: Uint8Array;
    userOrBotDelegateAccount: PublicKey;
    marketAccount: PublicKey;
    openOrdersAccount: PublicKey;
    botOrWorkingCapAccount: PublicKey;
    botAccount: PublicKey;
    coinVault: PublicKey;
    coinWalletAccount: PublicKey;
    pcVault: PublicKey;
    pcWalletAccount: PublicKey;
    vaultSigner: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface SerumCancelOrderIxParams {
    botSeed: Uint8Array;
    side: OrderSide;
    orderId: string;
    userOrBotDelegateAccount: PublicKey;
    marketAccount: PublicKey;
    bidsAccount: PublicKey;
    asksAccount: PublicKey;
    openOrdersAccount: PublicKey;
    botOrWorkingCapAccount: PublicKey;
    botAccount: PublicKey;
    eventQueueAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface SerumInitOpenOrdersIxParams {
    botSeed: Uint8Array;
    userOrBotDelegateAccount: PublicKey;
    marketAccount: PublicKey;
    openOrdersAccount: PublicKey;
    botOrWorkingCapAccount: PublicKey;
    botAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface SerumCloseOpenOrdersIxParams {
    botSeed: Uint8Array;
    userOrBotDelegateAccount: PublicKey;
    openOrdersAccount: PublicKey;
    botOrWorkingCapAccount: PublicKey;
    botAccount: PublicKey;
    userAccount: PublicKey;
    marketAccount: PublicKey;
    cellConfigAccount: PublicKey;
    programId: PublicKey;
}

export interface SerumPoolDepositIxParams {
    botSeed: Uint8Array;
    amount: Decimal;
    botAccount: PublicKey;
    botMintAccount: PublicKey;
    investorAccount: PublicKey;
    investorAssetAccount: PublicKey;
    investorBotTokenAccount: PublicKey;
    botAssetAccount: PublicKey;
    workingCapAccount: PublicKey;
    workingCapBaseTokenAccount: PublicKey;
    workingCapQuoteTokenAccount: PublicKey;
    openOrdersAccount: PublicKey;
    marketAccount: PublicKey;
    cellCacheAccount: PublicKey;
    baseTokenPythPriceAccount: PublicKey;
    quoteTokenPythPriceAccount: PublicKey;
    programId: PublicKey;
}

export interface SerumPoolWithdrawIxParams {
    botSeed: Uint8Array;
    amount: Decimal;
    botAccount: PublicKey;
    botMintAccount: PublicKey;
    investorAccount: PublicKey;
    investorAssetAccount: PublicKey;
    investorBotTokenAccount: PublicKey;
    botAssetAccount: PublicKey;
    cellCacheAccount: PublicKey;
    cellConfigAccount: PublicKey;
    cellAssetAccount: PublicKey;
    botOwnerAssetAccount: PublicKey;
    workingCapAccount: PublicKey;
    workingCapBaseTokenAccount: PublicKey;
    workingCapQuoteTokenAccount: PublicKey;
    openOrdersAccount: PublicKey;
    marketAccount: PublicKey;
    baseTokenPythPriceAccount: PublicKey;
    quoteTokenPythPriceAccount: PublicKey;
    programId: PublicKey;
}

export interface SerumPoolAdjustReserveIxParams {
    botSeed: Uint8Array;
    botAccount: PublicKey;
    userOrBotDelegateAccount: PublicKey;
    botAssetAccount: PublicKey;
    workingCapAccount: PublicKey;
    workingCapBaseTokenAccount: PublicKey;
    workingCapQuoteTokenAccount: PublicKey;
    openOrdersAccount: PublicKey;
    marketAccount: PublicKey;
    cellConfigAccount: PublicKey;
    baseTokenPythPriceAccount: PublicKey;
    quoteTokenPythPriceAccount: PublicKey;
    programId: PublicKey;
}
