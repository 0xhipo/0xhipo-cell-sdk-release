import { SolanaPool, AdjustPoolReserveParams, sendSolanaPayload } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaProgramId, solanaWallet } from '../../constant.example';

async function adjustReserveExample() {
    const pool = await SolanaPool.load(solanaConnection, solanaBotSeed, solanaProgramId);
    const params: AdjustPoolReserveParams = {
        protocol: pool.protocol,
        botSeed: solanaBotSeed,
        marketKey: pool.market,
        payer: solanaWallet.publicKey,
        programId: solanaProgramId,
    };
    const payload = await SolanaPool.adjustReserve(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
adjustReserveExample();
