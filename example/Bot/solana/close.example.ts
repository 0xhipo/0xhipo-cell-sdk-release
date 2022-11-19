import { SolanaBot, CloseBotParams, sendSolanaPayload } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaEnv, solanaWallet } from '../../constant.example';

async function closeExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: CloseBotParams = {
        protocol: bot.protocol,
        connection: solanaConnection,
        botSeed: solanaBotSeed,
        marketKey: bot.market,
        owner: bot.owner,
        referrer: bot.referrer,
        cellAdmin: solanaEnv.adminAccount,
        programId: solanaEnv.programId,
    };
    const payloads = await SolanaBot.close(params);

    for (const payload of payloads) {
        if (payload) {
            await sendSolanaPayload(solanaConnection, solanaWallet, payload, true);
        }
    }
}
closeExample();
