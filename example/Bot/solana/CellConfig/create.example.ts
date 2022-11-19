import { sendSolanaPayload, SolanaCellConfig } from '../../../../src';
import { solanaConnection, solanaEnv, solanaWallet } from '../../../constant.example';

async function createExample() {
    const payload = await SolanaCellConfig.create(solanaWallet.publicKey, solanaWallet.publicKey, solanaEnv.programId);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
createExample();
