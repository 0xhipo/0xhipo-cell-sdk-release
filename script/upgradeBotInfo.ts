import { getBotKeyBySeed, sendSolanaPayload, TransactionPayload, upgradeBotInfoIx } from '../src';
import base58 from 'bs58';
import { solanaConnection, solanaEnv, solanaWallet } from '../example/constant.example';

async function upgradeBotInfo() {
    const botSeeds = ['9SzK6BoPVpCfkKWpbYiaZGoPtB38guT9qXGVhdPUbNyC'];
    for (const botSeedStr of botSeeds) {
        const botSeed = base58.decode(botSeedStr);
        const botKey = await getBotKeyBySeed(botSeed, solanaEnv.programId);
        const payload: TransactionPayload = {
            instructions: [
                upgradeBotInfoIx({
                    botSeed,
                    botKey,
                    payerKey: solanaWallet.publicKey,
                    programId: solanaEnv.programId,
                }),
            ],
            signers: [],
        };
        await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
    }
}
upgradeBotInfo();
