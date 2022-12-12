import { Connection, PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { NearNetworkId } from './constant.type';

export enum BotStatus {
    Uninitialized = 0,
    Ready = 1,
    Running = 2,
    Stopped = 3,
    Abandoned = 4,
    StoppedByDelegate = 5,
    WithdrawOnly = 6,
}

export enum BotType {
    Neutral = 0,
    Long = 1,
    Short = 2,
    EnhancedNeutral = 3,
}

export enum Protocol {
    MangoPerp = 0,
    MangoSpot = 1,
    ZetaFuture = 2,
    Tonic = 3,
    SpinSpot = 4,
    SpinPerp = 5,
    Ref = 6,
    ZetaPerp = 7,
    Serum = 8,
}

export enum OrderSide {
    Bid = 0,
    Ask = 1,
}

export enum ZetaOrderSide {
    Bid = 1,
    Ask = 2,
}

export enum OrderType {
    Limit = 0,
    PostOnly = 1,
    Market = 2,
    IOC = 3,
}

export enum ZetaOrderType {
    Limit = 0,
    PostOnly = 1,
    FillOrKill = 2,
}

export enum SerumOrderType {
    Limit = 0,
    IOC = 1,
    PostOnly = 2,
}

export interface OpenOrder {
    price: Decimal;
    size: Decimal;
    side: OrderSide;
    orderId: string;
    clientId: string | null;
}

export interface BotInfo {
    value: Decimal;
    position: Decimal;
}

export interface SerumOpenOrdersAccountInfo {
    baseTokenFree: Decimal;
    baseTokenTotal: Decimal;
    quoteTokenFree: Decimal;
    quoteTokenTotal: Decimal;
}

export interface CreateBotParams {
    botOwner: PublicKey;
    depositBaseBalance: Decimal;
    depositQuoteBalance: Decimal;
    lowerPrice: Decimal;
    upperPrice: Decimal;
    gridNum: Decimal;
    leverage: Decimal;
    marketKey: PublicKey;
    protocol: Protocol;
    botType: BotType;
    startPrice: Decimal;
    programId: PublicKey;
    stopTopRatio: Decimal;
    stopBottomRatio: Decimal;
    trigger: boolean;
}

export interface StartBotParams {
    botSeed: Uint8Array;
    payer: PublicKey;
    programId: PublicKey;
}

export interface StopBotParams {
    protocol: Protocol;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    payer: PublicKey;
    programId: PublicKey;
}

export interface SetReferrerParams {
    referrer: PublicKey;
    botSeed: Uint8Array;
    userKey: PublicKey;
    programId: PublicKey;
}

export interface GetOpenOrdersParams {
    protocol: Protocol;
    connection: Connection;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    programId: PublicKey;
}

export interface PlaceOrderParams {
    protocol: Protocol;
    price: Decimal;
    quantity: Decimal;
    side: OrderSide;
    orderType: OrderType;
    clientId: string;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    payer: PublicKey;
    programId: PublicKey;
}

export interface CancelOrderParams {
    protocol: Protocol;
    botSeed: Uint8Array;
    side: OrderSide;
    orderId: string;
    marketKey: PublicKey;
    payer: PublicKey;
    programId: PublicKey;
}

export interface GetBotInfoParams {
    protocol: Protocol;
    connection: Connection;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    programId: PublicKey;
}

export interface CloseBotParams {
    protocol: Protocol;
    connection: Connection;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    owner: PublicKey;
    referrer: PublicKey;
    cellAdmin: PublicKey;
    programId: PublicKey;
}

export interface LoadNearBotParams {
    botIndex: number;
    contractId: string;
}

export interface NearBotAccount {
    contractId: string;
    owner: string;
    amount: Decimal;
    market: string;
    protocol: Protocol;
    type: BotType;
    status: BotStatus;
    startPrice: Decimal;
    lowerPrice: Decimal;
    upperPrice: Decimal;
    gridNumber: Decimal;
    leverage: Decimal;
    referer: string;
    perpFeeDiscount: Decimal;
    balances: { [key: string]: Decimal };
}

export interface NearBotInfo {
    contractId: string;
    owner: string;
    isClosed: boolean;
}

export interface CreateNearBotParams {
    protocol: Protocol;
    baseTokenBalance: Decimal;
    quoteTokenBalance: Decimal;
    lowerPrice: Decimal;
    upperPrice: Decimal;
    gridNumber: Decimal;
    leverage: Decimal;
    market: string;
    botType: BotType;
    startPrice: Decimal;
    referer: string;
    contractId: string;
    networkId: NearNetworkId;
}

export interface PlaceNearOrderParams {
    protocol: Protocol;
    market: string;
    price: Decimal;
    size: Decimal;
    side: OrderSide;
    orderType: OrderType;
    clientId: string;
    botIndex: number;
    contractId: string;
}

export interface GetNearBotInfoParams {
    protocol: Protocol;
    market: string;
    botIndex: number;
    contractId: string;
    networkId: NearNetworkId;
}

export interface CancelNearOrderParams {
    protocol: Protocol;
    orderId: string;
    market: string;
    botIndex: number;
    contractId: string;
    // REF
    amount?: Decimal;
    // REF
    side?: OrderSide;
}

export interface GetNearOpenOrdersParams {
    protocol: Protocol;
    market: string;
    botIndex: number;
    contractId: string;
    networkId: NearNetworkId;
}

export interface CancelAllNearOrdersParams {
    protocol: Protocol;
    market: string;
    botIndex: number;
    contractId: string;
}

export interface CloseNearBotParms {
    protocol: Protocol;
    market: string;
    botIndex: number;
    userAccountId: string;
    contractId: string;
    networkId: NearNetworkId;
}

export interface NearAccountState {
    amount: string;
    block_hash: string;
    block_height: number;
    code_hash: string;
    locked: string;
    storage_paid_at: number;
    storage_usage: number;
}

export interface NearSetDelegateParams {
    delegateAccountId: string;
    botIndex: number;
    contractId: string;
}

export interface NearSetCellConfigParams {
    delegateAccountId: string;
    createBotLine: Decimal;
    stopBotLine: Decimal;
    perpFeeRatio: Decimal;
    botOwnerMostPerpFeeRatio: Decimal;
    contractId: string;
}

export interface CloseSolanaBotMarketParams {
    protocol: Protocol;
    connection: Connection;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    payer: PublicKey;
    programId: PublicKey;
}

export interface CloseNearMarketParams {
    protocol: Protocol;
    market: string;
    botIndex: number;
    contractId: string;
    networkId: NearNetworkId;
}

export interface MangoReimbursementRow {
    index: number;
    owner: PublicKey;
    balances: Decimal[];
}
