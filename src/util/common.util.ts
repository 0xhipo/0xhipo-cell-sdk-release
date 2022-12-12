import {
    BotStatus,
    BotType,
    OrderSide,
    OrderType,
    Protocol,
    SerumOrderType,
    ZetaOrderSide,
    ZetaOrderType,
} from '../type';
import Decimal from 'decimal.js';
import { COIN_GECKO_TOKEN_MAP } from '../constant/coingecko.constant';
import { uiToNative } from './number.util';

export function zetaOrderSideTransform(side: OrderSide): ZetaOrderSide {
    return side == OrderSide.Bid ? ZetaOrderSide.Bid : ZetaOrderSide.Ask;
}

export function zetaOrderTypeTransform(orderType: OrderType): ZetaOrderType {
    switch (orderType) {
        case OrderType.Limit:
            return ZetaOrderType.Limit;
        case OrderType.PostOnly:
            return ZetaOrderType.PostOnly;
        default:
            throw `Unsupported zeta order type ${orderType}`;
    }
}

export function serumOrderTypeTransform(orderType: OrderType): SerumOrderType {
    switch (orderType) {
        case OrderType.Limit:
            return SerumOrderType.Limit;
        case OrderType.PostOnly:
            return SerumOrderType.PostOnly;
        case OrderType.IOC:
            return SerumOrderType.IOC;
        default:
            throw `Unsupported zeta order type ${orderType}`;
    }
}

// 6 decimals with last 2 decimals zero, e.g. 35.625413 -> 35625400
export function uiZetaPriceToNative(price: Decimal): Decimal {
    return uiToNative(price, 4).floor().mul(new Decimal(100));
}

export function botProtocolEnumToStr(protocol: Protocol): string {
    switch (protocol) {
        case Protocol.MangoPerp:
            return 'MangoPerp';
        case Protocol.MangoSpot:
            return 'MangoSpot';
        case Protocol.ZetaFuture:
            return 'ZetaFuture';
        case Protocol.ZetaPerp:
            return 'ZetaPerp';
        case Protocol.Tonic:
            return 'Tonic';
        case Protocol.Ref:
            return 'Ref';
        case Protocol.Serum:
            return 'Serum';
        case Protocol.SpinSpot:
            return 'SpinSpot';
        case Protocol.SpinPerp:
            return 'SpinPerp';
        default:
            throw `Invalid bot protocol type enum ${protocol}`;
    }
}

export function botProtocolStrToEnum(protocolType: string): Protocol {
    switch (protocolType) {
        case 'MangoPerp':
            return Protocol.MangoPerp;
        case 'MangoSpot':
            return Protocol.MangoSpot;
        case 'ZetaFuture':
            return Protocol.ZetaFuture;
        case 'Tonic':
            return Protocol.Tonic;
        case 'Ref':
            return Protocol.Ref;
        case 'Serum':
            return Protocol.Serum;
        case 'SpinSpot':
            return Protocol.SpinSpot;
        case 'SpinPerp':
            return Protocol.SpinPerp;
        default:
            throw `Invalid bot protocol type ${protocolType}`;
    }
}

export function botTypeStrToEnum(botType: string): BotType {
    switch (botType) {
        case 'Long':
            return BotType.Long;
        case 'Short':
            return BotType.Short;
        case 'Neutral':
            return BotType.Neutral;
        case 'EnhancedNeutral':
            return BotType.EnhancedNeutral;
        default:
            throw `Invalid bot type ${botType}`;
    }
}

export function botTypeEnumToStr(botType: BotType): string {
    switch (botType) {
        case BotType.Long:
            return 'Long';
        case BotType.Short:
            return 'Short';
        case BotType.Neutral:
            return 'Neutral';
        case BotType.EnhancedNeutral:
            return 'EnhancedNeutral';
        default:
            throw `Invalid bot type ${botType}`;
    }
}

export function botStatusStrToEnum(botStatus: string): BotStatus {
    switch (botStatus) {
        case 'Uninitialized':
            return BotStatus.Uninitialized;
        case 'Ready':
            return BotStatus.Ready;
        case 'Running':
            return BotStatus.Running;
        case 'Stopped':
            return BotStatus.Stopped;
        case 'Abandoned':
            return BotStatus.Abandoned;
        case 'StoppedByDelegate':
            return BotStatus.StoppedByDelegate;
        case 'WithdrawOnly':
            return BotStatus.WithdrawOnly;
        default:
            throw `Invalid bot status ${botStatus}`;
    }
}

export async function getMarketPrice(symbol: string): Promise<Decimal> {
    const coingeckoTokenId = COIN_GECKO_TOKEN_MAP[symbol] ? COIN_GECKO_TOKEN_MAP[symbol] : symbol.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/coins/${coingeckoTokenId}`;
    const usdPrice = await fetch(url)
        .then((res) => res.json())
        .then((resJson) => resJson['market_data']['current_price']['usd'] as number);
    return new Decimal(usdPrice);
}

export function tonicOrderSideTransform(side: OrderSide): string {
    return side == OrderSide.Bid ? 'Buy' : 'Sell';
}

export function tonicOrderTypeTransform(orderType: OrderType): string {
    switch (orderType) {
        case OrderType.Limit:
            return 'Limit';
        case OrderType.PostOnly:
            return 'PostOnly';
        case OrderType.Market:
            return 'Market';
        default:
            throw `Unsupported tonic order type ${orderType}`;
    }
}
