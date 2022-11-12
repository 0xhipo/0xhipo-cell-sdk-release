import { SolanaBot, GetBotInfoParams } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaProgramId } from '../../constant.example';

async function getBotInfoExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaProgramId);
    const params: GetBotInfoParams = {
        protocol: bot.protocol,
        connection: solanaConnection,
        botSeed: solanaBotSeed,
        marketKey: bot.market,
        programId: solanaProgramId,
    };
    const botInfo = await SolanaBot.getBotInfo(params);
    console.log(botInfo);
}
getBotInfoExample();
