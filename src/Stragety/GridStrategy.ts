import { DualInvestment, BotType, GetDualInvestmentParams, GetGridsParams, Grid, GridRebalanceParams } from '../type';
import Decimal from 'decimal.js';
import { ZERO_DECIMAL } from '../constant';

export class GridStrategy {
    /*
     * gridSize = (amount * leverage) / (((lowerPrice + upperPrice) * gridNumber) / 2)
     * priceInterval = (upperPrice - lowerPrice) / (gridNumber - 1)
     */
    static getGrids(params: GetGridsParams): Grid[] {
        const gridSize = params.amount
            .mul(params.leverage)
            .div(params.lowerPrice.add(params.upperPrice).mul(params.gridNumber).div(new Decimal(2)));
        const priceInterval = params.upperPrice.sub(params.lowerPrice).div(params.gridNumber.sub(new Decimal(1)));

        const grids: Grid[] = [];
        for (let gridIndex = 0; gridIndex < params.gridNumber.toNumber(); gridIndex++) {
            const gridPrice = params.lowerPrice.add(priceInterval.mul(new Decimal(gridIndex)));
            grids.push({
                index: gridIndex,
                price: gridPrice,
                size: gridSize,
            });
        }
        return grids;
    }

    /*
     *  assumed zero position / balance when market price >= upper price
     *  return SUM(quantity) of grid between market price and upper price
     */
    static rebalanceLongBot(grids: Grid[], upperPrice: Decimal, marketPrice: Decimal): Decimal {
        if (marketPrice.gte(upperPrice) || grids.length == 0) {
            return ZERO_DECIMAL;
        }

        let orderNumber = 0;
        for (const grid of grids) {
            if (grid.price.gte(marketPrice) && grid.price.lte(upperPrice)) {
                orderNumber += 1;
            }
        }
        return new Decimal(orderNumber).mul(grids[0].size);
    }

    /*
     * assumed zero position / balance when market price equal or less than lower price
     * return -SUM(quantity) of grids between lower price and market price
     */
    static rebalanceShortBot(grids: Grid[], lowerPrice: Decimal, marketPrice: Decimal): Decimal {
        if (marketPrice.lte(lowerPrice) || grids.length == 0) {
            return ZERO_DECIMAL;
        }

        let orderNumber = 0;
        for (const grid of grids) {
            if (grid.price.gte(lowerPrice) && grid.price.lte(marketPrice)) {
                orderNumber += 1;
            }
        }
        return new Decimal(orderNumber).mul(grids[0].size).neg();
    }

    /*
     * return SUM(quantity) of grid's' between startPrice and marketPrice
     * negative position / balance if marketPrice > startPrice
     * positive position / balance if startPrice > marketPrice
     */
    static rebalanceNeutralBot(grids: Grid[], startPrice: Decimal, marketPrice: Decimal): Decimal {
        if (startPrice.eq(marketPrice) || grids.length == 0) {
            return ZERO_DECIMAL;
        }
        const lowerPrice = Decimal.min(startPrice, marketPrice);
        const upperPrice = Decimal.max(startPrice, marketPrice);
        const direction = startPrice.gt(marketPrice) ? new Decimal(1) : new Decimal(-1);

        let orderNumber = 0;
        for (const grid of grids) {
            if (grid.price.gt(lowerPrice) && grid.price.lt(upperPrice)) {
                orderNumber += 1;
            }
        }
        return new Decimal(orderNumber).mul(grids[0].size).mul(direction);
    }

    /*
     * return bot position as it should be by bot params & market price
     */
    static rebalance(params: GridRebalanceParams): Decimal {
        const grids = this.getGrids(params);
        switch (params.botType) {
            case BotType.Long:
                return this.rebalanceLongBot(grids, params.upperPrice, params.marketPrice);
            case BotType.Short:
                return this.rebalanceShortBot(grids, params.lowerPrice, params.marketPrice);
            case BotType.Neutral:
                return this.rebalanceNeutralBot(grids, params.startPrice, params.marketPrice);
            case BotType.EnhancedNeutral:
                return ZERO_DECIMAL;
        }
    }

    /*
     * Estimate the amount of investment required when creating a bot using dual tokens
     * ONLY support SPOT LONG bot
     */
    static getDualInvestment(params: GetDualInvestmentParams): DualInvestment {
        const grids = this.getGrids({
            amount: new Decimal(1),
            leverage: new Decimal(1),
            lowerPrice: params.lowerPrice,
            upperPrice: params.upperPrice,
            gridNumber: params.gridNumber,
        });
        // number of grids which price lower than market price
        const lowerGridsNumber = grids.filter((grid) => grid.price.lt(params.marketPrice)).length;

        const quoteTokenRatio = new Decimal(lowerGridsNumber).div(params.gridNumber);
        const baseTokenRatio = new Decimal(1).sub(quoteTokenRatio);
        if (quoteTokenRatio.eq(ZERO_DECIMAL)) {
            throw `Get dual investment error: zero quote token ratio`;
        }

        const baseValue = params.quoteBalance.div(quoteTokenRatio).mul(baseTokenRatio);
        const baseBalance = baseValue.div(params.marketPrice);

        return {
            baseBalance,
            quoteBalance: params.quoteBalance,
        };
    }
}
