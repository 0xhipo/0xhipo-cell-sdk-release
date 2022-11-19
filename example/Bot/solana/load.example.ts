import { SolanaBot } from '../../../src';
import {solanaBotSeed, solanaConnection, solanaEnv} from '../../constant.example';

async function loadExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    console.log(bot);
    console.log(`Market: ${bot.market.toString()}`);
}
loadExample();
