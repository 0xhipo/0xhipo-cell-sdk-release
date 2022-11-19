import { SolanaPool, RedeemPoolParams, sendSolanaPayload } from '../../../src';
import Decimal from 'decimal.js';
import { solanaBotSeed, solanaConnection, solanaEnv, solanaWallet } from '../../constant.example';

async function redeemExample() {
    const pool = await SolanaPool.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: RedeemPoolParams = {
        protocol: pool.protocol,
        amount: new Decimal(0.1),
        botSeed: solanaBotSeed,
        marketKey: pool.market,
        investor: solanaWallet.publicKey,
        botOwner: pool.owner,
        cellAdmin: solanaEnv.adminAccount,
        programId: solanaEnv.programId,
    };
    const payload = await SolanaPool.redeem(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
redeemExample();
