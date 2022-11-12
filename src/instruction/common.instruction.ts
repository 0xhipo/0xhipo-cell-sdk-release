import { createATAIxParams } from '../type';
import { SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export function createATAIx(params: createATAIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.from([]),
        keys: [
            { pubkey: params.payerKey, isSigner: true, isWritable: true },
            { pubkey: params.ataKey, isSigner: false, isWritable: true },
            { pubkey: params.ownerKey, isSigner: false, isWritable: false },
            { pubkey: params.mintKey, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    });
}
