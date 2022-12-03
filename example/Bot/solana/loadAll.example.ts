import { SolanaBot } from '../../../src';
import { solanaConnection, solanaEnv } from '../../constant.example';

async function loadAllExample() {
    const bots = await SolanaBot.loadAll(solanaConnection, solanaEnv.programId);
    console.log(bots);
    console.log(`Bot number: ${bots.length}`);
}
loadAllExample();
