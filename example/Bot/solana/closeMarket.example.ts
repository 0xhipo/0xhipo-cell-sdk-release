import { CloseSolanaBotMarketParams, sendSolanaPayload, SolanaBot } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaEnv, solanaWallet } from '../../constant.example';

async function closeMarketExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: CloseSolanaBotMarketParams = {
        protocol: bot.protocol,
        connection: solanaConnection,
        botSeed: solanaBotSeed,
        marketKey: bot.market,
        payer: bot.owner,
        programId: solanaEnv.programId,
    };
    const payload = await SolanaBot.closeMarket(params);
    if (payload) {
        await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
    }
}
closeMarketExample();
