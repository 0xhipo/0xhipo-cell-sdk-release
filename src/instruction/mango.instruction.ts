import { SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import {InstructionIndex, MangoCreateReimbursementAccountIxParams, MangoReimbursementIxParams} from '../type';
import { MANGO_REIMBURSEMENT_GROUP_KEY, MANGO_REIMBURSEMENT_PROGRAM_ID } from '../constant';
import { Numberu64 } from '../util';
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";

export function createMangoReimbursementAccountIx(
    params: MangoCreateReimbursementAccountIxParams,
): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.CreateReimbursementAccount])),
            Buffer.concat([params.botSeed]),
        ]),
        keys: [
            { pubkey: MANGO_REIMBURSEMENT_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: MANGO_REIMBURSEMENT_GROUP_KEY, isSigner: false, isWritable: false },
            { pubkey: params.reimbursementAccount, isSigner: false, isWritable: true },
            { pubkey: params.mangoAccountOwnerAccount, isSigner: false, isWritable: true },
            { pubkey: params.payer, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function mangoReimbursementIx(params: MangoReimbursementIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.MangoReimbursement])),
            Buffer.concat([params.botSeed]),
            new Numberu64(params.tokenIndex).toBuffer(),
            new Numberu64(params.indexIntoTable).toBuffer(),
        ]),
        keys: [
            { pubkey: MANGO_REIMBURSEMENT_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: MANGO_REIMBURSEMENT_GROUP_KEY, isSigner: false, isWritable: false },
            { pubkey: params.vaultAccount, isSigner: false, isWritable: true },
            { pubkey: params.tokenAccount, isSigner: false, isWritable: true },
            { pubkey: params.reimbursementAccount, isSigner: false, isWritable: true },
            { pubkey: params.mangoAccountOwnerAccount, isSigner: false, isWritable: false },
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.claimMintTokenAccount, isSigner: false, isWritable: true },
            { pubkey: params.claimMintAccount, isSigner: false, isWritable: true },
            { pubkey: params.reimbursementTableAccount, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}
