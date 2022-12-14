import {
    AdjustPoolReserveParams,
    CancelOrderParams,
    CreateBotParams,
    DepositPoolParams,
    GetOpenOrdersParams,
    GetPoolInfoParams,
    ModifyPoolOrderParams,
    OpenOrder,
    PlaceOrderParams,
    Protocol,
    RedeemPoolParams,
    SetPoolWithdrawOnlyParams,
    TransactionPayload,
} from '../../type';
import { Connection, PublicKey } from '@solana/web3.js';
import { ZetaFuturePool } from './ZetaFuturePool';
import { ZetaPerpPool } from './ZetaPerpPool';
import { BotAccount } from '../../layout';
import { SolanaBot } from '../../Bot';
import { setPoolWithdrawOnlyIx } from '../../instruction';
import { botProtocolEnumToStr, getBotKeyBySeed, getCellConfigAccountKey } from '../../util';
import { SerumPool } from './SerumPool';

export class SolanaPool {
    static async load(connection: Connection, botSeed: Uint8Array, programId: PublicKey): Promise<BotAccount> {
        return SolanaBot.load(connection, botSeed, programId);
    }

    static async create(params: CreateBotParams): Promise<[Uint8Array, PublicKey, PublicKey, TransactionPayload]> {
        switch (params.protocol) {
            // case Protocol.ZetaFuture:
            //     return ZetaFuturePool.create(params);
            // case Protocol.ZetaPerp:
            //     return ZetaPerpPool.create(params);
            case Protocol.Serum:
                return SerumPool.create(params);
            default:
                throw `Create pool error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async deposit(params: DepositPoolParams) {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFuturePool.deposit(params);
            case Protocol.ZetaPerp:
                return ZetaPerpPool.deposit(params);
            case Protocol.Serum:
                return SerumPool.deposit(params);
            default:
                throw `Deposit pool error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async redeem(params: RedeemPoolParams) {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFuturePool.redeem(params);
            case Protocol.ZetaPerp:
                return ZetaPerpPool.redeem(params);
            case Protocol.Serum:
                return SerumPool.redeem(params);
            default:
                throw `Redeem pool error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async adjustReserve(params: AdjustPoolReserveParams) {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFuturePool.adjustReserve(params);
            case Protocol.ZetaPerp:
                return ZetaPerpPool.adjustReserve(params);
            case Protocol.Serum:
                return SerumPool.adjustReserve(params);
            default:
                throw `Adjust pool reserve error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async setWithdrawOnly(params: SetPoolWithdrawOnlyParams): Promise<TransactionPayload> {
        const cellConfigAccount = await getCellConfigAccountKey(params.programId);
        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        return {
            instructions: [
                setPoolWithdrawOnlyIx({
                    botSeed: params.botSeed,
                    botAccount: botKey,
                    delegateAccount: params.payer,
                    cellConfigAccount,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    static async getPoolInfo(params: GetPoolInfoParams) {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFuturePool.getPoolInfo(params);
            case Protocol.ZetaPerp:
                return ZetaPerpPool.getPoolInfo(params);
            case Protocol.Serum:
                return SerumPool.getPoolInfo(params);
            default:
                throw `Get pool info error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async getOpenOrders(params: GetOpenOrdersParams): Promise<OpenOrder[]> {
        switch (params.protocol) {
            case Protocol.Serum:
                return SerumPool.getOpenOrders(params);
            default:
                throw `Get pool open orders error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async placeOrder(params: PlaceOrderParams) {
        switch (params.protocol) {
            case Protocol.Serum:
                return SerumPool.placeOrder(params);
            default:
                throw `Place pool order error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async cancelOrder(params: CancelOrderParams) {
        switch (params.protocol) {
            case Protocol.Serum:
                return SerumPool.cancelOrder(params);
            default:
                throw `Cancel pool order error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async modifyOrder(params: ModifyPoolOrderParams) {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFuturePool.modifyOrder(params);
            case Protocol.ZetaPerp:
                return ZetaPerpPool.modifyOrder(params);
            default:
                throw `Modify pool order error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }
}
