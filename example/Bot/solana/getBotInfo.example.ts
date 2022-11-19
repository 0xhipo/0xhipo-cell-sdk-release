import { SolanaBot, GetBotInfoParams } from '../../../src';
import {solanaBotSeed, solanaConnection, solanaEnv} from '../../constant.example';

async function getBotInfoExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: GetBotInfoParams = {
        protocol: bot.protocol,
        connection: solanaConnection,
        botSeed: solanaBotSeed,
        marketKey: bot.market,
        programId: solanaEnv.programId,
    };
    const botInfo = await SolanaBot.getBotInfo(params);
    console.log(botInfo);
}
getBotInfoExample();
