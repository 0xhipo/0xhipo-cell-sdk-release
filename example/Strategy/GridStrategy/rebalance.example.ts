import { getMarketPrice, GridRebalanceParams, GridStrategy, SolanaBot } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaEnv } from '../../constant.example';

async function rebalanceExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const marketPrice = await getMarketPrice('SOL');
    console.log(`Market price: ${marketPrice}`);

    const params: GridRebalanceParams = {
        botType: bot.type,
        amount: bot.amount,
        leverage: bot.leverage,
        lowerPrice: bot.lowerPrice,
        upperPrice: bot.upperPrice,
        gridNumber: bot.gridNumber,
        marketPrice: marketPrice,
        startPrice: bot.startPrice,
    };
    const rebalance = await GridStrategy.rebalance(params);
    console.log(rebalance);
}
rebalanceExample();
