import {
    CancelZetaOrderIxParams,
    CloseZetaOpenOrdersIxParams,
    DepositToZetaIxParams,
    InitZetaMarginAccountIxParams,
    InitZetaOpenOrdersIxParams,
    InstructionIndex,
    PlaceZetaOrderIxParams,
    PlaceZetaPerpOrderIxParams,
    SettleZetaMarketIxParams,
    WithdrawFromZetaIxParams,
    ZetaPoolAdjustReserveIxParams,
    ZetaPoolDepositIxParams,
    ZetaPoolWithdrawIxParams,
} from '../type';
import { SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import {
    ZETA_DEX_PROGRAM_ID,
    ZETA_MINT_AUTHORITY_KEY,
    ZETA_PROGRAM_ID,
    ZETA_SERUM_AUTHORITY_KEY,
    ZETA_STATE_ACCOUNT,
} from '../constant';
import { Numberu128, Numberu64, Numberu8 } from '../util';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export function initZetaMarginAccountIx(params: InitZetaMarginAccountIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.InitZetaMarginAccount])),
            Buffer.concat([params.botSeed]),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: true },
            { pubkey: ZETA_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: params.zetaGroupKey, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function depositToZetaIx(params: DepositToZetaIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.DepositToZeta])),
            Buffer.concat([params.botSeed]),
            new Numberu64(params.amount.toString()).toBuffer(),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: params.zetaGroupKey, isSigner: false, isWritable: false },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: true },
            { pubkey: params.zetaVaultKey, isSigner: false, isWritable: true },
            { pubkey: params.botTokenAccount, isSigner: false, isWritable: true },
            { pubkey: params.zetaSocializedLossKey, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ZETA_STATE_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: params.zetaGreeksKey, isSigner: false, isWritable: false },
            { pubkey: ZETA_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function withdrawFromZetaIx(params: WithdrawFromZetaIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.WithdrawFromZeta])),
            Buffer.concat([params.botSeed]),
            new Numberu64(params.amount.toString()).toBuffer(),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: ZETA_STATE_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: params.zetaGroupKey, isSigner: false, isWritable: false },
            { pubkey: params.zetaVaultKey, isSigner: false, isWritable: true },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: true },
            { pubkey: params.botTokenAccount, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.zetaGreeksKey, isSigner: false, isWritable: false },
            { pubkey: params.zetaGroupOracleKey, isSigner: false, isWritable: false },
            { pubkey: params.zetaSocializedLossKey, isSigner: false, isWritable: true },
            { pubkey: ZETA_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function initZetaOpenOrdersIx(params: InitZetaOpenOrdersIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.InitZetaOpenOrders])),
            Buffer.concat([params.botSeed]),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: ZETA_STATE_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: params.zetaGroupKey, isSigner: false, isWritable: false },
            { pubkey: ZETA_DEX_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: true },
            { pubkey: params.marketAccount, isSigner: false, isWritable: false },
            { pubkey: ZETA_SERUM_AUTHORITY_KEY, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersMapAccount, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: ZETA_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function placeZetaOrderIx(params: PlaceZetaOrderIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.PlaceZetaOrder])),
            Buffer.concat([params.botSeed]),
            new Numberu64(params.price.toString()).toBuffer(),
            new Numberu64(params.size.toString()).toBuffer(),
            Buffer.from(Int8Array.from([params.side])),
            Buffer.from(Int8Array.from([params.orderType])),
            new Numberu64(params.clientOrderId).toBuffer(),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: ZETA_STATE_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: params.zetaGroupKey, isSigner: false, isWritable: false },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: true },
            { pubkey: ZETA_DEX_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ZETA_SERUM_AUTHORITY_KEY, isSigner: false, isWritable: false },
            { pubkey: params.zetaGreeksKey, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: params.marketAccount, isSigner: false, isWritable: true },
            { pubkey: params.requestQueueAccount, isSigner: false, isWritable: true },
            { pubkey: params.eventQueueAccount, isSigner: false, isWritable: true },
            { pubkey: params.bidsAccount, isSigner: false, isWritable: true },
            { pubkey: params.asksAccount, isSigner: false, isWritable: true },
            { pubkey: params.orderPayerTokenAccount, isSigner: false, isWritable: true },
            { pubkey: params.coinVault, isSigner: false, isWritable: true },
            { pubkey: params.pcVault, isSigner: false, isWritable: true },
            { pubkey: params.coinWallet, isSigner: false, isWritable: true },
            { pubkey: params.pcWallet, isSigner: false, isWritable: true },
            { pubkey: params.zetaGroupOracleKey, isSigner: false, isWritable: false },
            { pubkey: params.zetaMarketNode, isSigner: false, isWritable: true },
            { pubkey: params.zetaMarketMint, isSigner: false, isWritable: true },
            { pubkey: ZETA_MINT_AUTHORITY_KEY, isSigner: false, isWritable: false },
            { pubkey: ZETA_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function cancelZetaOrderIx(params: CancelZetaOrderIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.CancelZetaOrder])),
            Buffer.concat([params.botSeed]),
            Buffer.from(Int8Array.from([params.side])),
            new Numberu128(params.orderId).toBuffer(),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: params.zetaGroupKey, isSigner: false, isWritable: false },
            { pubkey: ZETA_STATE_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: true },
            { pubkey: ZETA_DEX_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ZETA_SERUM_AUTHORITY_KEY, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
            { pubkey: params.marketAccount, isSigner: false, isWritable: true },
            { pubkey: params.bidsAccount, isSigner: false, isWritable: true },
            { pubkey: params.asksAccount, isSigner: false, isWritable: true },
            { pubkey: params.eventQueueAccount, isSigner: false, isWritable: true },
            { pubkey: ZETA_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function closeZetaOpenOrdersIx(params: CloseZetaOpenOrdersIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.CloseZetaOpenOrders])),
            Buffer.concat([params.botSeed]),
            new Numberu8(params.openOrdersMapNonce).toBuffer(),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: true },
            { pubkey: ZETA_STATE_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: params.zetaGroupKey, isSigner: false, isWritable: false },
            { pubkey: ZETA_DEX_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: true },
            { pubkey: params.marketAccount, isSigner: false, isWritable: false },
            { pubkey: ZETA_SERUM_AUTHORITY_KEY, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersMapAccount, isSigner: false, isWritable: true },
            { pubkey: ZETA_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.userKey, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function settleZetaMarketIx(params: SettleZetaMarketIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([new Numberu64('16289140328060839845').toBuffer()]),
        keys: [
            { pubkey: ZETA_STATE_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: params.marketKey, isSigner: false, isWritable: true },
            { pubkey: params.baseVault, isSigner: false, isWritable: true },
            { pubkey: params.quoteVault, isSigner: false, isWritable: true },
            { pubkey: params.dexBaseVault, isSigner: false, isWritable: true },
            { pubkey: params.dexQuoteVault, isSigner: false, isWritable: true },
            { pubkey: params.vaultOwner, isSigner: false, isWritable: false },
            { pubkey: ZETA_MINT_AUTHORITY_KEY, isSigner: false, isWritable: false },
            { pubkey: ZETA_SERUM_AUTHORITY_KEY, isSigner: false, isWritable: false },
            { pubkey: ZETA_DEX_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
        ],
        programId: ZETA_PROGRAM_ID,
    });
}

export function zetaPoolDepositIx(params: ZetaPoolDepositIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.ZetaPoolDeposit])),
            Buffer.concat([params.botSeed]),
            new Numberu64(params.amount.toString()).toBuffer(),
        ]),
        keys: [
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.botAccount, isSigner: false, isWritable: false },
            { pubkey: params.botMintAccount, isSigner: false, isWritable: true },
            { pubkey: params.investorAccount, isSigner: true, isWritable: false },
            { pubkey: params.investorAssetAccount, isSigner: false, isWritable: true },
            { pubkey: params.investorBotTokenAccount, isSigner: false, isWritable: true },
            { pubkey: params.botAssetAccount, isSigner: false, isWritable: true },
            { pubkey: params.cellCacheAccount, isSigner: false, isWritable: true },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: false },
            { pubkey: params.zetaGreeksAccount, isSigner: false, isWritable: false },
            { pubkey: params.zetaGroupAccount, isSigner: false, isWritable: false },
            { pubkey: params.pythPriceAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function zetaPoolWithdrawIx(params: ZetaPoolWithdrawIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.ZetaPoolWithdraw])),
            Buffer.concat([params.botSeed]),
            new Numberu64(params.amount.toString()).toBuffer(),
        ]),
        keys: [
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.botAccount, isSigner: false, isWritable: false },
            { pubkey: params.botMintAccount, isSigner: false, isWritable: true },
            { pubkey: params.investorAccount, isSigner: true, isWritable: false },
            { pubkey: params.investorAssetAccount, isSigner: false, isWritable: true },
            { pubkey: params.investorBotTokenAccount, isSigner: false, isWritable: true },
            { pubkey: params.botAssetAccount, isSigner: false, isWritable: true },
            { pubkey: params.cellCacheAccount, isSigner: false, isWritable: true },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: true },
            { pubkey: params.cellAssetAccount, isSigner: false, isWritable: true },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: false },
            { pubkey: params.zetaGreeksAccount, isSigner: false, isWritable: false },
            { pubkey: params.zetaGroupAccount, isSigner: false, isWritable: false },
            { pubkey: params.pythPriceAccount, isSigner: false, isWritable: false },
            { pubkey: params.botOwnerAssetAccount, isSigner: false, isWritable: true },
        ],
        programId: params.programId,
    });
}

export function zetaPoolAdjustReserveIx(params: ZetaPoolAdjustReserveIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.ZetaPoolAdjustReserve])),
            Buffer.concat([params.botSeed]),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: ZETA_STATE_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: params.zetaGroupAccount, isSigner: false, isWritable: false },
            { pubkey: params.zetaVaultAccount, isSigner: false, isWritable: true },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: true },
            { pubkey: params.botAssetTokenAccount, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.zetaGreeksAccount, isSigner: false, isWritable: false },
            { pubkey: params.zetaOracleAccount, isSigner: false, isWritable: false },
            { pubkey: params.zetaSocializedLossAccount, isSigner: false, isWritable: true },
            { pubkey: ZETA_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
            { pubkey: params.pythPriceAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function placeZetaPerpOrderIx(params: PlaceZetaPerpOrderIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.PlaceZetaPerpOrder])),
            Buffer.concat([params.botSeed]),
            new Numberu64(params.price.toString()).toBuffer(),
            new Numberu64(params.size.toString()).toBuffer(),
            Buffer.from(Int8Array.from([params.side])),
            Buffer.from(Int8Array.from([params.orderType])),
            // Buffer.from(Int8Array.from([1])),
            new Numberu64(params.clientOrderId).toBuffer(),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.userOrBotDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: ZETA_STATE_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: params.zetaGroupKey, isSigner: false, isWritable: false },
            { pubkey: params.zetaMarginAccount, isSigner: false, isWritable: true },
            { pubkey: ZETA_DEX_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ZETA_SERUM_AUTHORITY_KEY, isSigner: false, isWritable: false },
            { pubkey: params.zetaGreeksKey, isSigner: false, isWritable: false },
            { pubkey: params.openOrdersAccount, isSigner: false, isWritable: true },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: params.marketAccount, isSigner: false, isWritable: true },
            { pubkey: params.requestQueueAccount, isSigner: false, isWritable: true },
            { pubkey: params.eventQueueAccount, isSigner: false, isWritable: true },
            { pubkey: params.bidsAccount, isSigner: false, isWritable: true },
            { pubkey: params.asksAccount, isSigner: false, isWritable: true },
            { pubkey: params.orderPayerTokenAccount, isSigner: false, isWritable: true },
            { pubkey: params.coinVault, isSigner: false, isWritable: true },
            { pubkey: params.pcVault, isSigner: false, isWritable: true },
            { pubkey: params.coinWallet, isSigner: false, isWritable: true },
            { pubkey: params.pcWallet, isSigner: false, isWritable: true },
            { pubkey: params.zetaGroupOracleKey, isSigner: false, isWritable: false },
            { pubkey: params.zetaMarketMint, isSigner: false, isWritable: true },
            { pubkey: ZETA_MINT_AUTHORITY_KEY, isSigner: false, isWritable: false },
            { pubkey: params.perpSyncQueue, isSigner: false, isWritable: true },
            { pubkey: ZETA_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}
