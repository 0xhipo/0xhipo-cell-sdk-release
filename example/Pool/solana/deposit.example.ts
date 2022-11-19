import { SolanaPool, DepositPoolParams, sendSolanaPayload } from '../../../src';
import Decimal from 'decimal.js';
import {solanaBotSeed, solanaConnection, solanaEnv, solanaWallet} from '../../constant.example';

async function depositExample() {
    const pool = await SolanaPool.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: DepositPoolParams = {
        protocol: pool.protocol,
        connection: solanaConnection,
        amount: new Decimal(0.1),
        botSeed: solanaBotSeed,
        marketKey: pool.market,
        investor: solanaWallet.publicKey,
        programId: solanaEnv.programId,
    };
    const payload = await SolanaPool.deposit(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
depositExample();
