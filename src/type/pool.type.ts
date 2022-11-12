import { Connection, PublicKey } from '@solana/web3.js';
import { OrderSide, OrderType, Protocol } from './bot.type';
import Decimal from 'decimal.js';

export interface PoolInfo {
    botValue: Decimal;
    dexValue: Decimal;
    position: Decimal;
}

export interface DepositPoolParams {
    protocol: Protocol;
    connection: Connection;
    amount: Decimal;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    investor: PublicKey;
    programId: PublicKey;
}

export interface RedeemPoolParams {
    protocol: Protocol;
    amount: Decimal;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    investor: PublicKey;
    botOwner: PublicKey;
    programId: PublicKey;
}

export interface AdjustPoolReserveParams {
    protocol: Protocol;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    payer: PublicKey;
    programId: PublicKey;
}

export interface GetPoolInfoParams {
    protocol: Protocol;
    connection: Connection;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    programId: PublicKey;
}

export interface ModifyPoolOrderParams {
    protocol: Protocol;
    existedOrderId: string;
    existedOrderSide: OrderSide;
    newOrderPrice: Decimal;
    newOrderSize: Decimal;
    newOrderSide: OrderSide;
    newOrderType: OrderType;
    newOrderClientId: string;
    botSeed: Uint8Array;
    marketKey: PublicKey;
    payer: PublicKey;
    programId: PublicKey;
}

export interface SetPoolWithdrawOnlyParams {
    botSeed: Uint8Array;
    payer: PublicKey;
    programId: PublicKey;
}
