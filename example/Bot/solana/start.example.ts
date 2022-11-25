import { sendSolanaPayload, SolanaBot, StartBotParams } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaEnv, solanaWallet } from '../../constant.example';

async function startExample() {
    const params: StartBotParams = {
        botSeed: solanaBotSeed,
        payer: solanaWallet.publicKey,
        programId: solanaEnv.programId,
    };
    const payload = await SolanaBot.start(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
startExample();
