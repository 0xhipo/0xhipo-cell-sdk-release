import { SolanaPool, DepositPoolParams, sendSolanaPayload } from '../../../src';
import Decimal from 'decimal.js';
import { solanaBotSeed, solanaConnection, solanaProgramId, solanaWallet } from '../../constant.example';

async function depositExample() {
    const pool = await SolanaPool.load(solanaConnection, solanaBotSeed, solanaProgramId);
    const params: DepositPoolParams = {
        protocol: pool.protocol,
        connection: solanaConnection,
        amount: new Decimal(0.1),
        botSeed: solanaBotSeed,
        marketKey: pool.market,
        investor: solanaWallet.publicKey,
        programId: solanaProgramId,
    };
    const payload = await SolanaPool.deposit(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
depositExample();
