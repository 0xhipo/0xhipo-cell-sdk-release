import { GetDualInvestmentParams, GridStrategy } from '../../../src';
import Decimal from 'decimal.js';

async function getDualInvestmentExample() {
    const params: GetDualInvestmentParams = {
        quoteBalance: new Decimal(1000),
        lowerPrice: new Decimal(10),
        upperPrice: new Decimal(20),
        gridNumber: new Decimal(100),
        marketPrice: new Decimal(19),
    };
    const dualInvestment = GridStrategy.getDualInvestment(params);
    console.log(dualInvestment);
}
getDualInvestmentExample();
