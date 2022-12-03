import BN from 'bn.js';
import { seq, struct, Structure, u16, u8 } from 'buffer-layout';
import { bool, publicKeyLayout, u128, u64 } from '@blockworks-foundation/mango-client';
import { PublicKey } from '@solana/web3.js';
import { BotStatus, BotType, Protocol } from '../type';
import Decimal from 'decimal.js';
import { bnToDecimal } from '../util';

export class BotAccount {
    seed: Uint8Array;
    owner: PublicKey;
    status: BotStatus;
    amount: Decimal;
    lowerPrice: Decimal;
    upperPrice: Decimal;
    gridNumber: Decimal;
    market: PublicKey;
    leverage: Decimal;
    depositedAssetsQuantity: BN[];
    protocol: Protocol;
    type: BotType;
    stopTopRatio: Decimal;
    stopBottomRatio: Decimal;
    trigger: boolean;
    lastAdjustReserveTs: Decimal;
    isPool: boolean;
    startPrice: Decimal;
    referrer: PublicKey;
    createTime: Decimal;
    version: Decimal;

    constructor(decoded: any) {
        Object.assign(this, decoded);
        this.amount = bnToDecimal(decoded['amount']);
        this.lowerPrice = bnToDecimal(decoded['lowerPrice']);
        this.upperPrice = bnToDecimal(decoded['upperPrice']);
        this.gridNumber = bnToDecimal(decoded['gridNumber']);
        this.leverage = bnToDecimal(decoded['leverage']);
        this.stopTopRatio = bnToDecimal(decoded['stopTopRatio']);
        this.stopBottomRatio = bnToDecimal(decoded['stopBottomRatio']);
        this.lastAdjustReserveTs = bnToDecimal(decoded['lastAdjustReserveTs']);
        this.startPrice = bnToDecimal(decoded['startPrice']);
        this.version = bnToDecimal(decoded['version']);
        this.createTime = bnToDecimal(decoded['createTime']);
        this.depositedAssetsQuantity = decoded['depositedAssetsQuantity'].map((i) => bnToDecimal(i));
        delete this['padding'];
        delete this['padding2'];
    }
}

export class BotAccountLayout extends Structure {
    constructor(property) {
        super(
            [
                seq(u8(), 32, 'seed'),
                publicKeyLayout('owner'),
                u8('status'),
                u128('amount'),
                u64('lowerPrice'),
                u64('upperPrice'),
                u16('gridNumber'),
                publicKeyLayout('market'),
                u16('leverage'),
                seq(u64(), 17, 'depositedAssetsQuantity'),
                seq(u8(), 72, 'padding'),
                u8('protocol'),
                u8('type'),
                u8('stopTopRatio'),
                u8('stopBottomRatio'),
                bool('trigger'),
                u64('lastAdjustReserveTs'),
                bool('isPool'),
                u64('startPrice'),
                publicKeyLayout('referrer'),
                u64('createTime'),
                u8('version'),
                seq(u8(), 100, 'padding2'),
            ],
            property,
        );
    }

    decode(b, offset) {
        return new BotAccount(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

export function botAccountLayout(property = '') {
    return new BotAccountLayout(property);
}

export const CellConfigAccountLayout = struct([
    publicKeyLayout('admin'),
    publicKeyLayout('delegate'),
    u64('createBotLine'),
    u64('stopBotLine'),
    u64('reserveFreq'),
    u8('reserveRatio'),
    u8('performanceFeeRatio'),
    u8('botOwnerMostPerformanceFeeRatio'),
    u8('performanceFeeDiscount'),
    u8('referrerPerformanceFeeRatio'),
]);

export const CellCacheAccountLayout = struct([
    seq(u8(), 32, 'botSeed'),
    publicKeyLayout('investorKey'),
    u64('investCost'),
    seq(u8(), 100, 'padding'),
]);

export interface CellConfigAccount {
    admin: PublicKey;
    delegate: PublicKey;
    createBotLine: number;
    stopBotLine: number;
    reserveFreq: number;
    reserveRatio: number;
    performanceFeeRatio: number;
    botOwnerMostPerformanceFeeRatio: number;
    performanceFeeDiscount: number;
    referrerPerformanceFeeRatio: number;
}

export interface CellCacheAccount {
    botSeed: Uint8Array;
    investorKey: PublicKey;
    investCost: Decimal;
}
