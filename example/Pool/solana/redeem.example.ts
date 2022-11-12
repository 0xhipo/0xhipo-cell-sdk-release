import { SolanaPool, RedeemPoolParams, sendSolanaPayload } from '../../../src';
import Decimal from 'decimal.js';
import { solanaBotSeed, solanaConnection, solanaProgramId, solanaWallet } from '../../constant.example';

async function redeemExample() {
    const pool = await SolanaPool.load(solanaConnection, solanaBotSeed, solanaProgramId);
    const params: RedeemPoolParams = {
        protocol: pool.protocol,
        amount: new Decimal(0.1),
        botSeed: solanaBotSeed,
        marketKey: pool.market,
        investor: solanaWallet.publicKey,
        botOwner: pool.owner,
        programId: solanaProgramId,
    };
    const payload = await SolanaPool.redeem(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
redeemExample();
