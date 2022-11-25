import {
    BotInfo,
    CancelOrderParams,
    CloseBotParams,
    CloseSolanaBotMarketParams,
    CreateBotParams,
    GetBotInfoParams,
    GetOpenOrdersParams,
    OpenOrder,
    PlaceOrderParams,
    Protocol,
    SetReferrerParams,
    StartBotParams,
    StopBotParams,
    TransactionPayload,
} from '../../type';
import { Connection, PublicKey } from '@solana/web3.js';
import { ZetaFutureBot } from './ZetaFutureBot';
import { ZetaPerpBot } from './ZetaPerpBot';
import { botProtocolEnumToStr, getBotKeyBySeed, getCellConfigAccountKey, nativeToUi } from '../../util';
import {
    cellConfigReallocIx,
    createCellConfigAccountIx,
    setBotReferrerkeyIx,
    setCellConfigIx,
    startBotIx,
} from '../../instruction';
import { BotAccount, botAccountLayout, CellConfigAccount, CellConfigAccountLayout } from '../../layout';
import { CellConfigAccountNotFoundError } from '../../error';
import { SerumBot } from './SerumBot';
import { MangoSpotBot } from './MangoSpotBot';
import { MangoPerpBot } from './MangoPerpBot';

export class SolanaBot {
    static async load(connection: Connection, botSeed: Uint8Array, programId: PublicKey): Promise<BotAccount> {
        const botKey = await getBotKeyBySeed(botSeed, programId);
        const accountInfo = await connection.getAccountInfo(botKey);
        if (!accountInfo) {
            throw `Load bot error: ${botKey.toString()} account not found`;
        }
        const bot = botAccountLayout('').decode(accountInfo.data, 0);
        return {
            ...bot,
            amount: nativeToUi(bot.amount, 6),
            lowerPrice: nativeToUi(bot.lowerPrice, 6),
            upperPrice: nativeToUi(bot.upperPrice, 6),
            leverage: nativeToUi(bot.leverage, 2),
            startPrice: nativeToUi(bot.startPrice, 6),
        };
    }

    static async create(params: CreateBotParams): Promise<[Uint8Array, PublicKey, PublicKey, TransactionPayload]> {
        switch (params.protocol) {
            // case Protocol.ZetaFuture:
            //     return ZetaFutureBot.create(params);
            // case Protocol.ZetaPerp:
            //     return ZetaPerpBot.create(params);
            case Protocol.Serum:
                return SerumBot.create(params);
            default:
                throw `Create bot error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async start(params: StartBotParams): Promise<TransactionPayload> {
        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        return {
            instructions: [
                startBotIx({
                    botSeed: params.botSeed,
                    botKey,
                    userKey: params.payer,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    static async stop(params: StopBotParams): Promise<TransactionPayload> {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFutureBot.stop(params);
            case Protocol.ZetaPerp:
                return ZetaPerpBot.stop(params);
            case Protocol.Serum:
                return SerumBot.stop(params);
            default:
                throw `Stop bot error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async setReferrer(params: SetReferrerParams): Promise<TransactionPayload> {
        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        return {
            instructions: [
                setBotReferrerkeyIx({
                    botSeed: params.botSeed,
                    referrerKey: params.referrer,
                    botKey: botKey,
                    userKey: params.userKey,
                    programId: params.programId,
                }),
            ],
            signers: [],
        };
    }

    static async getBotInfo(params: GetBotInfoParams): Promise<BotInfo> {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFutureBot.getBotInfo(params);
            case Protocol.ZetaPerp:
                return ZetaPerpBot.getBotInfo(params);
            case Protocol.Serum:
                return SerumBot.getBotInfo(params);
            default:
                throw `Get bot info error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async getOpenOrders(params: GetOpenOrdersParams): Promise<OpenOrder[]> {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFutureBot.getOpenOrders(params);
            case Protocol.ZetaPerp:
                return ZetaPerpBot.getOpenOrders(params);
            case Protocol.Serum:
                return SerumBot.getOpenOrders(params);
            default:
                throw `Get open orders error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async placeOrder(params: PlaceOrderParams): Promise<TransactionPayload> {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFutureBot.placeOrder(params);
            case Protocol.ZetaPerp:
                return ZetaPerpBot.placeOrder(params);
            case Protocol.Serum:
                return SerumBot.placeOrder(params);
            default:
                throw `Place order error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async cancelOrder(params: CancelOrderParams): Promise<TransactionPayload> {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFutureBot.cancelOrder(params);
            case Protocol.ZetaPerp:
                return ZetaPerpBot.cancelOrder(params);
            case Protocol.Serum:
                return SerumBot.cancelOrder(params);
            default:
                throw `Cancel order error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async closeMarket(params: CloseSolanaBotMarketParams): Promise<TransactionPayload | undefined> {
        switch (params.protocol) {
            case Protocol.Serum:
                return SerumBot.closeMarket(params);
            default:
                throw `Close market error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static async close(params: CloseBotParams): Promise<(TransactionPayload | undefined)[]> {
        switch (params.protocol) {
            case Protocol.ZetaFuture:
                return ZetaFutureBot.close(params);
            case Protocol.ZetaPerp:
                return ZetaPerpBot.close(params);
            case Protocol.Serum:
                return SerumBot.close(params);
            case Protocol.MangoSpot:
                return MangoSpotBot.close(params);
            case Protocol.MangoPerp:
                return MangoPerpBot.close(params);
            default:
                throw `Close bot error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }
}

export class SolanaCellConfig {
    static async load(connection: Connection, programId: PublicKey): Promise<CellConfigAccount> {
        const cellConfigKey = await getCellConfigAccountKey(programId);
        const accountInfo = await connection.getAccountInfo(cellConfigKey);
        if (!accountInfo) {
            throw new CellConfigAccountNotFoundError(cellConfigKey.toString());
        }
        const cellConfigAccount = CellConfigAccountLayout.decode(accountInfo.data);
        return {
            ...cellConfigAccount,
            createBotLine: cellConfigAccount.createBotLine.toNumber(),
            stopBotLine: cellConfigAccount.stopBotLine.toNumber(),
            reserveFreq: cellConfigAccount.reserveFreq.toNumber(),
            reserveRatio: cellConfigAccount.reserveRatio / Math.pow(10, 2),
            performanceFeeRatio: cellConfigAccount.performanceFeeRatio / Math.pow(10, 2),
            botOwnerMostPerformanceFeeRatio: cellConfigAccount.botOwnerMostPerformanceFeeRatio / Math.pow(10, 2),
            performanceFeeDiscount: cellConfigAccount.performanceFeeDiscount / Math.pow(10, 2),
            referrerPerformanceFeeRatio: cellConfigAccount.referrerPerformanceFeeRatio / Math.pow(10, 2),
        };
    }

    static async create(adminAccount: PublicKey, payer: PublicKey, programId: PublicKey): Promise<TransactionPayload> {
        const cellConfigKey = await getCellConfigAccountKey(programId);
        return {
            instructions: [
                createCellConfigAccountIx({
                    adminAccount,
                    payerAccount: payer,
                    cellConfigKey,
                    programId,
                }),
            ],
            signers: [],
        };
    }

    static async setConfig(
        adminAccount: PublicKey,
        delegate: PublicKey,
        createBotLine: number,
        stopBotLine: number,
        reserveFreq: number,
        reserveRatio: number,
        performanceFeeRatio: number,
        botOwnerMostPerformanceFeeRatio: number,
        performanceFeeDiscount: number,
        referrerPerformanceFeeRatio: number,
        programId: PublicKey,
    ): Promise<TransactionPayload> {
        const cellConfigAccount = await getCellConfigAccountKey(programId);
        return {
            instructions: [
                setCellConfigIx({
                    delegate,
                    createBotLine,
                    stopBotLine,
                    reserveFreq,
                    reserveRatio: reserveRatio * Math.pow(10, 2),
                    performanceFeeRatio: performanceFeeRatio * Math.pow(10, 2),
                    botOwnerMostPerformanceFeeRatio: botOwnerMostPerformanceFeeRatio * Math.pow(10, 2),
                    performanceFeeDiscount: performanceFeeDiscount * Math.pow(10, 2),
                    referrerPerformanceFeeRatio: referrerPerformanceFeeRatio * Math.pow(10, 2),
                    cellConfigAccount,
                    adminAccount,
                    programId,
                }),
            ],
            signers: [],
        };
    }

    static async reallocate(
        addSize: number,
        adminAccount: PublicKey,
        programId: PublicKey,
    ): Promise<TransactionPayload> {
        const cellConfigAccount = await getCellConfigAccountKey(programId);
        return {
            instructions: [
                cellConfigReallocIx({
                    addSize,
                    cellConfigAccount,
                    adminAccount,
                    programId,
                }),
            ],
            signers: [],
        };
    }
}
