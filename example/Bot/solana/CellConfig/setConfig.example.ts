import { sendSolanaPayload, SolanaCellConfig } from '../../../../src';
import { PublicKey } from '@solana/web3.js';
import { solanaConnection, solanaEnv, solanaWallet } from '../../../constant.example';

async function setConfigExample() {
    const delegate = new PublicKey('BefBuFi7LCjEzFDAxWd3DqxtDYmaeJZDV6cqtoGx5EZB');
    const payload = await SolanaCellConfig.setConfig(
        solanaWallet.publicKey,
        delegate,
        1,
        1,
        600,
        0.2,
        0.1,
        0.3,
        0.1,
        0.1,
        solanaEnv.programId,
    );
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
setConfigExample();
