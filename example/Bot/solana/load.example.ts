import { SolanaBot } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaProgramId } from '../../constant.example';

async function loadExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaProgramId);
    console.log(bot);
    console.log(`Market: ${bot.market.toString()}`);
}
loadExample();
