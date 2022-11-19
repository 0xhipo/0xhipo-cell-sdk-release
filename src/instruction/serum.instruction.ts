import {
    InstructionIndex,
    SerumCancelOrderIxParams,
    SerumCloseOpenOrdersIxParams,
    SerumInitOpenOrdersIxParams,
    SerumPlaceOrderIxParams,
    SerumSettleFundsIxParams,
} from '../type';
import { SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import { Numberu128, Numberu64 } from '../util';
import { SERUM_PROGRAM_ID } from '../constant';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export function serumPlaceOrderIx(params: SerumPlaceOrderIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SerumPlaceOrder])),
            Buffer.concat([params.botSeed]),
            Buffer.from(Int8Array.from([params.side])),
            Buffer.from(Int8Array.from([params.orderType])),
            new Numberu64(params.limitPrice.toString()).toBuffer(),
            new Numberu64(params.amountToTrade.toString()).toBuffer(),
            new Numberu64(params.coinLotSize.toString()).toBuffer(),
            new Numberu64(params.pcLotSize.toString()).toBuffer(),
            new Numberu64(params.clientOrderId.toString()).toBuffer(),
        ]),
        keys: [
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: params.marketAccount, isSigner: false, isWritable: true },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
            { pubkey: params.requestQueueAccount, isSigner: false, isWritable: true },
            { pubkey: params.eventQueueAccount, isSigner: false, isWritable: true },
            { pubkey: params.bidsAccount, isSigner: false, isWritable: true },
            { pubkey: params.asksAccount, isSigner: false, isWritable: true },
            { pubkey: params.botOrWorkingCapAssetAccount, isSigner: false, isWritable: true },
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.botOrWorkingCapAccount, isSigner: false, isWritable: true },
            { pubkey: params.coinVault, isSigner: false, isWritable: true },
            { pubkey: params.pcVault, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: SERUM_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function serumSettleFundsIx(params: SerumSettleFundsIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SerumSettleFunds])),
            Buffer.concat([params.botSeed]),
        ]),
        keys: [
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: SERUM_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.marketAccount, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.coinVault, isSigner: false, isWritable: true },
            { pubkey: params.coinWalletAccount, isSigner: false, isWritable: true },
            { pubkey: params.pcVault, isSigner: false, isWritable: true },
            { pubkey: params.pcWalletAccount, isSigner: false, isWritable: true },
            { pubkey: params.vaultSigner, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function serumCancelOrderIx(params: SerumCancelOrderIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SerumCancelOrder])),
            Buffer.concat([params.botSeed]),
            Buffer.from(Int8Array.from([params.side])),
            new Numberu128(params.orderId).toBuffer(),
        ]),
        keys: [
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: SERUM_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.marketAccount, isSigner: false, isWritable: true },
            { pubkey: params.bidsAccount, isSigner: false, isWritable: true },
            { pubkey: params.asksAccount, isSigner: false, isWritable: true },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
            { pubkey: params.botAccount, isSigner: false, isWritable: false },
            { pubkey: params.eventQueueAccount, isSigner: false, isWritable: true },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function serumInitOpenOrdersIx(params: SerumInitOpenOrdersIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SerumInitOpenOrders])),
            Buffer.concat([params.botSeed]),
        ]),
        keys: [
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: true },
            { pubkey: SERUM_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.marketAccount, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
            { pubkey: params.botAccount, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function serumCloseOpenOrdersIx(params: SerumCloseOpenOrdersIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SerumCloseOpenOrers])),
            Buffer.concat([params.botSeed]),
        ]),
        keys: [
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: SERUM_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
            { pubkey: params.botAccount, isSigner: false, isWritable: false },
            { pubkey: params.userAccount, isSigner: false, isWritable: true },
            { pubkey: params.marketAccount, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}
