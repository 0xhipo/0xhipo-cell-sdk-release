import { SolanaBot, CloseBotParams, sendSolanaPayload } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaProgramId, solanaWallet } from '../../constant.example';

async function closeExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaProgramId);
    const params: CloseBotParams = {
        protocol: bot.protocol,
        connection: solanaConnection,
        botSeed: solanaBotSeed,
        marketKey: bot.market,
        owner: bot.owner,
        referrer: bot.referrer,
        programId: solanaProgramId,
    };
    const payloads = await SolanaBot.close(params);

    for (const payload of payloads) {
        await sendSolanaPayload(solanaConnection, solanaWallet, payload, false, true);
    }
}
closeExample();
