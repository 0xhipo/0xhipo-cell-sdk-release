import { SolanaBot, GetOpenOrdersParams } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaProgramId } from '../../constant.example';

async function getOpenOrdersExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaProgramId);
    const params: GetOpenOrdersParams = {
        protocol: bot.protocol,
        connection: solanaConnection,
        botSeed: solanaBotSeed,
        marketKey: bot.market,
        programId: solanaProgramId,
    };
    const openOrders = await SolanaBot.getOpenOrders(params);
    console.log(openOrders);
}
getOpenOrdersExample();
