import { Signer, TransactionInstruction } from '@solana/web3.js';
import { Action } from 'near-api-js/lib/transaction';

export interface TransactionPayload {
    instructions: TransactionInstruction[];
    signers: Signer[];
}

export interface NearTransactionPayload {
    receiverId: string;
    actions: Action[];
}
