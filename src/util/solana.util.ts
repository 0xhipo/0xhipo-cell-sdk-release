import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import {
    CellCacheAccount,
    CellCacheAccountLayout,
    MangoReimbursementAccount,
    mangoReimbursementAccountLayout,
    MangoReimbursementGroup,
    mangoReimbursementGroupLayout,
    MangoReimbursementTableLayout,
    ZetaGroupAccount,
    zetaGroupAccountLayout,
    ZetaMarginAccount,
    zetaMarginAccountLayout,
} from '../layout';
import Decimal from 'decimal.js';
import {
    MANGO_REIMBURSEMENT_GROUP_KEY,
    MANGO_REIMBURSEMENT_PROGRAM_ID,
    ZERO_DECIMAL,
    ZETA_DEX_PROGRAM_ID,
    ZETA_PROGRAM_ID,
} from '../constant';
import {
    MangoReimbursementRow,
    SerumOpenOrdersAccountInfo,
    SolanaTokenConfig,
    TransactionPayload,
    ZetaAssetConfig,
    ZetaExpirySeries,
} from '../type';
import { _OPEN_ORDERS_LAYOUT_V2 } from '@project-serum/serum/lib/market';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import crypto from 'crypto';
import { createATAIx, redeemAllAssetsFromBotIx } from '../instruction';
import { bnToDecimal, nativeToUi } from './number.util';
import { getTokenConfigBySymbol, getZetaAssetConfigBySymbol } from './constant.util';

export async function getZetaMarginAccount(
    connection: Connection,
    marginAccountKey: PublicKey,
): Promise<ZetaMarginAccount> {
    const accountInfo = await connection.getAccountInfo(marginAccountKey);
    if (!accountInfo) {
        throw `Get zeta margin account error: ${marginAccountKey.toString()} account not available`;
    }
    return zetaMarginAccountLayout('').decode(accountInfo.data, 0);
}

export async function getATABalance(connection: Connection, ataKey: PublicKey): Promise<Decimal> {
    return connection.getTokenAccountBalance(ataKey).then((tokenAmount) => {
        if (!tokenAmount) {
            return ZERO_DECIMAL;
        }
        return nativeToUi(new Decimal(tokenAmount.value.amount), tokenAmount.value.decimals);
    });
}

export async function getSerumOpenOrdersAccountInfo(
    connection: Connection,
    openOrdersAccountKey: PublicKey,
): Promise<SerumOpenOrdersAccountInfo | null> {
    const accountInfo = await connection.getAccountInfo(openOrdersAccountKey);
    if (!accountInfo) {
        console.log(`Serum open orders account ${openOrdersAccountKey.toString()} not found`);
        return null;
    }
    const openOrdersAccount = _OPEN_ORDERS_LAYOUT_V2.decode(accountInfo.data);
    return {
        baseTokenFree: bnToDecimal(openOrdersAccount['baseTokenFree']),
        baseTokenTotal: bnToDecimal(openOrdersAccount['baseTokenTotal']),
        quoteTokenFree: bnToDecimal(openOrdersAccount['quoteTokenFree']),
        quoteTokenTotal: bnToDecimal(openOrdersAccount['quoteTokenTotal']),
    };
}

export async function getATAKey(ownerKey: PublicKey, mintKey: PublicKey): Promise<PublicKey> {
    return await PublicKey.findProgramAddress(
        [ownerKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintKey.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID,
    ).then((res) => res[0]);
}

export function getBotKeyBySeed(botSeed: Uint8Array, programId: PublicKey): Promise<PublicKey> {
    return PublicKey.createProgramAddress([botSeed], programId);
}

export function getBotMintKeyBySeed2(botSeed: Uint8Array, programId: PublicKey): Promise<PublicKey> {
    return PublicKey.createProgramAddress([botSeed, new Uint8Array([1])], programId);
}

export async function genValidBotAccount(programId: PublicKey): Promise<[Uint8Array, PublicKey, PublicKey]> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const botSeed = crypto.randomBytes(32);
        const botKey = await getBotKeyBySeed(botSeed, programId).catch(() => null);
        const botMintKey = await getBotMintKeyBySeed2(botSeed, programId).catch(() => null);

        if (botKey && botMintKey) {
            return [botSeed, botKey, botMintKey];
        }
    }
}

// check ATA, return payload if ATA not existed
export async function createATA(
    connection: Connection,
    ownerKey: PublicKey,
    tokenMint: PublicKey,
    payerAccount: PublicKey,
): Promise<[PublicKey, TransactionInstruction | null]> {
    const ataKey = await getATAKey(ownerKey, tokenMint);
    return connection.getAccountInfo(ataKey).then((accountInfo) => {
        if (accountInfo) {
            return [ataKey, null];
        }
        return [
            ataKey,
            createATAIx({
                ataKey,
                ownerKey,
                mintKey: tokenMint,
                payerKey: payerAccount,
            }),
        ];
    });
}

export async function getBotZetaMarginAccountKeyBySeed(
    botSeed: Uint8Array,
    zetaGroupKey: PublicKey,
    programId: PublicKey,
): Promise<PublicKey> {
    const botKey = await getBotKeyBySeed(botSeed, programId);
    return PublicKey.findProgramAddress(
        [Buffer.from('margin'), zetaGroupKey.toBuffer(), botKey.toBuffer()],
        ZETA_PROGRAM_ID,
    ).then((res) => res[0]);
}

export async function getBotZetaOpenOrdersAccountKey(botKey: PublicKey, marketKey: PublicKey): Promise<PublicKey> {
    return PublicKey.findProgramAddress(
        [Buffer.from('open-orders', 'utf-8'), ZETA_DEX_PROGRAM_ID.toBuffer(), marketKey.toBuffer(), botKey.toBuffer()],
        ZETA_PROGRAM_ID,
    ).then((res) => res[0]);
}

export async function getZetaOpenOrdersMapKey(openOrdersAccountKey: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([openOrdersAccountKey.toBuffer()], ZETA_PROGRAM_ID);
}

export async function getCellConfigAccountKey(programId: PublicKey): Promise<PublicKey> {
    return PublicKey.findProgramAddress([Buffer.from('config', 'utf-8')], programId).then((res) => res[0]);
}

export async function getCellCacheKey(botKey: PublicKey, userKey: PublicKey, programId: PublicKey): Promise<PublicKey> {
    return PublicKey.findProgramAddress(
        [botKey.toBuffer(), userKey.toBuffer(), Buffer.from('cell-cache', 'utf-8')],
        programId,
    ).then((res) => res[0]);
}

/*
 * @param mint dex base / quote vault
 * returns zeta base / quote vault
 */
export async function getZetaVault(mint: PublicKey): Promise<PublicKey> {
    return PublicKey.findProgramAddress([Buffer.from('zeta-vault'), mint.toBuffer()], ZETA_PROGRAM_ID).then(
        (res) => res[0],
    );
}

export async function getCellCacheAccount(
    connection: Connection,
    botSeed: Uint8Array,
    userKey: PublicKey,
    programId: PublicKey,
): Promise<CellCacheAccount> {
    const botKey = await getBotKeyBySeed(botSeed, programId);
    const cellCacheKey = await getCellCacheKey(botKey, userKey, programId);

    const accountInfo = await connection.getAccountInfo(cellCacheKey);
    if (!accountInfo) {
        throw `Get cell cache account error: account ${cellCacheKey.toString()} not available`;
    }
    const cellCache = CellCacheAccountLayout.decode(accountInfo.data);
    return {
        ...cellCache,
        investCost: nativeToUi(new Decimal(cellCache.investCost.toString()), 6),
    };
}

export async function sendSolanaPayload(
    connection: Connection,
    payer: Keypair,
    payload: TransactionPayload,
    confirm = true,
    skipPreflight = false,
) {
    const tx = new Transaction({ feePayer: payer.publicKey });
    tx.add(...payload.instructions);
    const signers = payload.signers.length == 0 ? [payer] : [payer, ...payload.signers];

    let signature: string | void;
    if (confirm) {
        signature = await sendAndConfirmTransaction(connection, tx, signers, { skipPreflight }).catch((e) => {
            console.error(e);
            throw e;
        });
    } else {
        signature = await connection.sendTransaction(tx, signers, { skipPreflight }).catch((e) => {
            console.error(e);
            throw e;
        });
    }

    console.log(`Signature: ${signature}`);
    return signature;
}

export async function getZetaGroup(connection: Connection, baseSymbol: string): Promise<ZetaGroupAccount> {
    const assetConfig = getZetaAssetConfigBySymbol(baseSymbol) as ZetaAssetConfig;
    const zetaGroupAccount = await connection.getAccountInfo(assetConfig.groupAccount);
    if (!zetaGroupAccount) {
        throw `Get Zeta group error: account not existed ${assetConfig.groupAccount}`;
    }
    return zetaGroupAccountLayout('').decode(zetaGroupAccount.data, 0);
}

// return timestamp in ms
export async function getZetaExpirySeries(connection: Connection, baseSymbol: string): Promise<ZetaExpirySeries[]> {
    const zetaGroup = await getZetaGroup(connection, baseSymbol);
    return zetaGroup.expirySeries.map((i) => {
        return {
            activeTs: i['activeTs'].muln(1000).toNumber(),
            expiryTs: i['expiryTs'].muln(1000).toNumber(),
        };
    });
}

export function getSerumOpenOrdersAccountKey(botKey: PublicKey, programId: PublicKey) {
    return PublicKey.findProgramAddress([botKey.toBuffer(), Buffer.from('open-orders', 'utf-8')], programId).then(
        (res) => res[0],
    );
}

export function getMangoReimbursementAccountKey(ownerKey: PublicKey) {
    return PublicKey.findProgramAddress(
        [Buffer.from('ReimbursementAccount'), MANGO_REIMBURSEMENT_GROUP_KEY.toBuffer(), ownerKey.toBuffer()],
        MANGO_REIMBURSEMENT_PROGRAM_ID,
    ).then((res) => res[0]);
}

export async function getMangoReimbursementGroup(connection: Connection): Promise<MangoReimbursementGroup> {
    const accountInfo = await connection.getAccountInfo(MANGO_REIMBURSEMENT_GROUP_KEY);
    if (!accountInfo) {
        throw `Get mango reimbursement group error: account not found ${MANGO_REIMBURSEMENT_GROUP_KEY.toString()}`;
    }
    return mangoReimbursementGroupLayout('').decode(accountInfo.data, 0);
}

export async function getMangoReimbursementTable(connection: Connection, reimbursementTableKey: PublicKey) {
    const accountInfo = await connection.getAccountInfo(reimbursementTableKey);
    if (!accountInfo) {
        throw `Get mango reimbursement table error: account not found ${reimbursementTableKey.toString()}`;
    }
    return MangoReimbursementTableLayout.decode(accountInfo.data.slice(40));
}

export async function getMangoReimbursementRow(
    connection,
    botKey: PublicKey,
): Promise<MangoReimbursementRow | undefined> {
    const reimbursementGroup = await getMangoReimbursementGroup(connection);
    const rows = await getMangoReimbursementTable(connection, reimbursementGroup.table).then((res) => res['rows']);
    for (const [index, row] of rows.entries()) {
        if (row['owner'].equals(botKey)) {
            return { index, owner: row['owner'], balances: row['balances'].map((i) => new Decimal(i.toString())) };
        }
    }
}

export async function getMangoReimbursementAccount(
    connection: Connection,
    reimbursementAccountKey: PublicKey,
): Promise<MangoReimbursementAccount | undefined> {
    const accountInfo = await connection.getAccountInfo(reimbursementAccountKey);
    if (!accountInfo) {
        return;
    }
    return mangoReimbursementAccountLayout('').decode(accountInfo.data, 0);
}

export async function redeemAllFromBot(
    connection: Connection,
    botSeed: Uint8Array,
    owner: PublicKey,
    referrer: PublicKey,
    cellAdmin: PublicKey,
    tokenSymbols: string[],
    programId: PublicKey,
): Promise<TransactionPayload> {
    if (tokenSymbols.length == 0) {
        throw `Redeem all from bot error: no asset in redeem token list`;
    }
    const botKey = await getBotKeyBySeed(botSeed, programId);
    const botMintKey = await getBotMintKeyBySeed2(botSeed, programId);
    const ownerBotMintATA = await getATAKey(owner, botMintKey);
    const cellConfigKey = await getCellConfigAccountKey(programId);

    const payload: TransactionPayload = { instructions: [], signers: [] };
    const botAssetKeys: PublicKey[] = [];
    const ownerAssetKeys: PublicKey[] = [];
    const cellAssetKeys: PublicKey[] = [];
    const assetPriceKeys: PublicKey[] = [];
    const referrerAssetKeys: PublicKey[] = [];
    for (const tokenSymbol of tokenSymbols) {
        const tokenConfig = getTokenConfigBySymbol(tokenSymbol) as SolanaTokenConfig;

        const botTokenATA = await getATAKey(botKey, tokenConfig.mintKey);
        botAssetKeys.push(botTokenATA);

        const [ownerTokenATA, createOwnerTokenATAIx] = await createATA(connection, owner, tokenConfig.mintKey, owner);
        if (createOwnerTokenATAIx) {
            payload.instructions.push(createOwnerTokenATAIx);
        }
        ownerAssetKeys.push(ownerTokenATA);

        const [cellTokenATA, createCellTokenATAIx] = await createATA(connection, cellAdmin, tokenConfig.mintKey, owner);
        if (createCellTokenATAIx) {
            payload.instructions.push(createCellTokenATAIx);
        }
        cellAssetKeys.push(cellTokenATA);

        assetPriceKeys.push(tokenConfig.pythPriceKey);

        if (!referrer.equals(PublicKey.default)) {
            const [referrerTokenATA, createReferrerTokenATAIx] = await createATA(
                connection,
                referrer,
                tokenConfig.mintKey,
                owner,
            );
            if (createReferrerTokenATAIx) {
                payload.instructions.push(createReferrerTokenATAIx);
            }
            referrerAssetKeys.push(referrerTokenATA);
        }
    }
    payload.instructions.push(
        redeemAllAssetsFromBotIx({
            botSeed,
            botKey,
            botMintKey,
            userBotTokenKey: ownerBotMintATA,
            userKey: owner,
            referrerKey: referrer,
            botAssetKeys,
            userAssetKeys: ownerAssetKeys,
            cellAssetKeys,
            assetPriceKeys,
            cellConfigKey: cellConfigKey,
            referrerAssetKeys,
            programId: programId,
        }),
    );
    return payload;
}

export function getSerumPoolWorkingCapKey(botKey: PublicKey, programId: PublicKey) {
    return PublicKey.findProgramAddress([botKey.toBuffer(), Buffer.from('working-cap', 'utf-8')], programId).then(
        (res) => res[0],
    );
}
