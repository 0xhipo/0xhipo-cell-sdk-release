import {
    CellConfigReallocIxParams,
    CreateBotIxParams,
    CreateCellConfigAccountIxParams,
    InstructionIndex,
    RedeemAllAssetsFromBotIxParams,
    SetBotGridInfoIxParams,
    SetBotReferrerkeyIxParams,
    SetCellConfigDelegateIxParams,
    SetCellConfigIxParams,
    SetCellConfigReserveInfoIxParams,
    SetCellFeeIxParams,
    SetPoolWithdrawOnlyIxParams,
    StartBotIxParams,
    StopBotIxParams,
    UpdateBotInfoIxParams,
    UpgradeBotInfo2IxParams,
    UpgradeBotInfoIxParams,
} from '../type';
import { SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import { Numberu16, Numberu32, Numberu64, Numberu8 } from '../util';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export function createBotIx(params: CreateBotIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.CreateBot])),
            Buffer.concat([params.botSeed]),
            new Numberu64(params.depositAssetQuantity.toString()).toBuffer(),
            new Numberu64(params.lowerPrice.toString()).toBuffer(),
            new Numberu64(params.upperPrice.toString()).toBuffer(),
            new Numberu16(params.gridNum.toString()).toBuffer(),
            new Numberu16(params.leverage.toString()).toBuffer(),
            Buffer.from(Int8Array.from([params.protocol])),
            Buffer.from(Int8Array.from([params.botType])),
            new Numberu8(params.stopTopRatio.toString()).toBuffer(),
            new Numberu8(params.stopBottomRatio.toString()).toBuffer(),
            new Numberu8(params.trigger ? 1 : 0).toBuffer(),
            new Numberu8(params.isPool ? 1 : 0).toBuffer(),
            new Numberu64(params.startPrice.toString()).toBuffer(),
        ]),
        keys: [
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.botKey, isSigner: false, isWritable: true },
            { pubkey: params.botMintKey, isSigner: false, isWritable: true },
            { pubkey: params.botAssetKey, isSigner: false, isWritable: true },
            { pubkey: params.userAssetKey, isSigner: false, isWritable: true },
            { pubkey: params.userBotTokenKey, isSigner: false, isWritable: true },
            { pubkey: params.assetPriceKey, isSigner: false, isWritable: false },
            { pubkey: params.userKey, isSigner: true, isWritable: false },
            { pubkey: params.cellCacheAccount, isSigner: false, isWritable: true },
            { pubkey: params.marketKey, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function redeemAllAssetsFromBotIx(params: RedeemAllAssetsFromBotIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.RedeemAllAssetsFromBot])),
            Buffer.concat([params.botSeed]),
        ]),
        keys: [
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigKey, isSigner: false, isWritable: false },
            { pubkey: params.botKey, isSigner: false, isWritable: true },
            { pubkey: params.botMintKey, isSigner: false, isWritable: true },
            { pubkey: params.userBotTokenKey, isSigner: false, isWritable: true },
            { pubkey: params.userKey, isSigner: true, isWritable: false },
            { pubkey: params.referrerKey, isSigner: false, isWritable: false },
            ...params.botAssetKeys.map((botAssetKey) => {
                return { pubkey: botAssetKey, isSigner: false, isWritable: true };
            }),
            ...params.userAssetKeys.map((userAssetKey) => {
                return { pubkey: userAssetKey, isSigner: false, isWritable: true };
            }),
            ...params.cellAssetKeys.map((cellAssetKey) => {
                return { pubkey: cellAssetKey, isSigner: false, isWritable: true };
            }),
            ...params.assetPriceKeys.map((assetPriceKey) => {
                return { pubkey: assetPriceKey, isSigner: false, isWritable: false };
            }),
            ...params.referrerAssetKeys.map((i) => {
                return { pubkey: i, isSigner: false, isWritable: true };
            }),
        ],
        programId: params.programId,
    });
}

export function startBotIx(params: StartBotIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.StartBot])),
            Buffer.concat([params.botSeed]),
        ]),
        keys: [
            { pubkey: params.botKey, isSigner: false, isWritable: true },
            { pubkey: params.userKey, isSigner: true, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function stopBotIx(params: StopBotIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([Buffer.from(Int8Array.from([InstructionIndex.StopBot])), Buffer.concat([params.botSeed])]),
        keys: [
            { pubkey: params.botKey, isSigner: false, isWritable: true },
            { pubkey: params.userKey, isSigner: true, isWritable: false },
            { pubkey: params.pythPriceAccount, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function createCellConfigAccountIx(params: CreateCellConfigAccountIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([Buffer.from(Int8Array.from([InstructionIndex.CreateCellConfigAccount]))]),
        keys: [
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: params.cellConfigKey, isSigner: false, isWritable: true },
            { pubkey: params.adminAccount, isSigner: false, isWritable: false },
            { pubkey: params.payerAccount, isSigner: true, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function setCellFeeIx(params: SetCellFeeIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SetCellFee])),
            new Numberu32(params.feePercent).toBuffer(),
        ]),
        keys: [
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: true },
            { pubkey: params.adminOrDelegateAccount, isSigner: true, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function setCellConfigDelegateIx(params: SetCellConfigDelegateIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([Buffer.from(Int8Array.from([InstructionIndex.SetCellConfigDelegate]))]),
        keys: [
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: true },
            { pubkey: params.delegateAccount, isSigner: false, isWritable: false },
            { pubkey: params.adminAccount, isSigner: true, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function updateBotInfoIx(params: UpdateBotInfoIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.UpdateBotInfo])),
            Buffer.concat([params.botSeed]),
            Buffer.from(Int8Array.from([params.botType])),
            new Numberu8(params.stopTopRatio).toBuffer(),
            new Numberu8(params.stopBottomRatio).toBuffer(),
            new Numberu8(params.trigger).toBuffer(),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.delegateAccount, isSigner: true, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function setCellConfigReserveInfoIx(params: SetCellConfigReserveInfoIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SetCellConfigReserveInfo])),
            new Numberu8(params.reserveRatio).toBuffer(),
            new Numberu64(params.reserveFreq).toBuffer(),
        ]),
        keys: [
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: true },
            { pubkey: params.adminOrDelegateAccount, isSigner: true, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function setBotGridInfoIx(params: SetBotGridInfoIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SetBotGridInfo])),
            new Numberu64(params.amountToTrade).toBuffer(),
            new Numberu64(params.upperPrice).toBuffer(),
            new Numberu64(params.lowerPrice).toBuffer(),
            new Numberu16(params.gridNum).toBuffer(),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.userOrDelegateAccount, isSigner: true, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function setPoolWithdrawOnlyIx(params: SetPoolWithdrawOnlyIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SetPoolWithdrawOnly])),
            Buffer.concat([params.botSeed]),
        ]),
        keys: [
            { pubkey: params.botAccount, isSigner: false, isWritable: true },
            { pubkey: params.delegateAccount, isSigner: true, isWritable: false },
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function setCellConfigIx(params: SetCellConfigIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SetCellConfig])),
            params.delegate.toBuffer(),
            new Numberu64(params.createBotLine).toBuffer(),
            new Numberu64(params.stopBotLine).toBuffer(),
            new Numberu64(params.reserveFreq).toBuffer(),
            Buffer.from(Int8Array.from([params.reserveRatio])),
            Buffer.from(Int8Array.from([params.performanceFeeRatio])),
            Buffer.from(Int8Array.from([params.botOwnerMostPerformanceFeeRatio])),
            Buffer.from(Int8Array.from([params.performanceFeeDiscount])),
            Buffer.from(Int8Array.from([params.referrerPerformanceFeeRatio])),
        ]),
        keys: [
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: true },
            { pubkey: params.adminAccount, isSigner: true, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function cellConfigReallocIx(params: CellConfigReallocIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.CellConfigRealloc])),
            new Numberu16(params.addSize).toBuffer(),
        ]),
        keys: [
            { pubkey: params.cellConfigAccount, isSigner: false, isWritable: true },
            { pubkey: params.adminAccount, isSigner: true, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function upgradeBotInfoIx(params: UpgradeBotInfoIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.UpgradeBotInfo])),
            Buffer.concat([params.botSeed]),
            new Numberu64(params.upperPrice).toBuffer(),
            new Numberu64(params.lowerPrice).toBuffer(),
        ]),
        keys: [
            { pubkey: params.botKey, isSigner: false, isWritable: true },
            { pubkey: params.payerKey, isSigner: true, isWritable: false },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: params.programId,
    });
}

export function upgradeBotInfo2Ix(params: UpgradeBotInfo2IxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.UpgradeBotInfo2])),
            Buffer.concat([params.botSeed]),
            new Numberu64(params.upperPrice).toBuffer(),
            new Numberu64(params.lowerPrice).toBuffer(),
            new Numberu64(params.startPrice).toBuffer(),
        ]),
        keys: [{ pubkey: params.botKey, isSigner: false, isWritable: true }],
        programId: params.programId,
    });
}

export function setBotReferrerkeyIx(params: SetBotReferrerkeyIxParams): TransactionInstruction {
    return new TransactionInstruction({
        data: Buffer.concat([
            Buffer.from(Int8Array.from([InstructionIndex.SetBotReferrerKey])),
            Buffer.concat([params.botSeed]),
            params.referrerKey.toBuffer(),
        ]),
        keys: [
            { pubkey: params.botKey, isSigner: false, isWritable: true },
            { pubkey: params.userKey, isSigner: true, isWritable: true },
        ],
        programId: params.programId,
    });
}
