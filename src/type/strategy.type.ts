import { BotType } from './bot.type';
import Decimal from 'decimal.js';

export interface GridRebalanceParams {
    botType: BotType;
    amount: Decimal;
    leverage: Decimal;
    lowerPrice: Decimal;
    upperPrice: Decimal;
    gridNumber: Decimal;
    marketPrice: Decimal;
    startPrice: Decimal;
}

export interface GetGridsParams {
    amount: Decimal;
    leverage: Decimal;
    lowerPrice: Decimal;
    upperPrice: Decimal;
    gridNumber: Decimal;
}

export interface Grid {
    index: number;
    price: Decimal;
    size: Decimal;
}
