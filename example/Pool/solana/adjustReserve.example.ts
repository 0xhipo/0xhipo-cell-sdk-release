import { SolanaPool, AdjustPoolReserveParams, sendSolanaPayload } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaEnv, solanaWallet } from '../../constant.example';

async function adjustReserveExample() {
    const pool = await SolanaPool.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: AdjustPoolReserveParams = {
        protocol: pool.protocol,
        botSeed: solanaBotSeed,
        marketKey: pool.market,
        payer: solanaWallet.publicKey,
        programId: solanaEnv.programId,
    };
    const payload = await SolanaPool.adjustReserve(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
adjustReserveExample();
