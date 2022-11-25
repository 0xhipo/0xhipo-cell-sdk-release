import {SolanaBot, GetOpenOrdersParams, SolanaPool} from '../../../src';
import { solanaBotSeed, solanaConnection, solanaEnv } from '../../constant.example';

async function getOpenOrdersExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: GetOpenOrdersParams = {
        protocol: bot.protocol,
        connection: solanaConnection,
        botSeed: solanaBotSeed,
        marketKey: bot.market,
        programId: solanaEnv.programId,
    };
    const openOrders = await SolanaPool.getOpenOrders(params);
    console.log(openOrders);
}
getOpenOrdersExample();
