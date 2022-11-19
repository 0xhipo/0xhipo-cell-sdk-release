import { CloseBotParams, SolanaTokenConfig, TransactionPayload } from '../../type';
import {
    createATA,
    getATABalance,
    getATAKey,
    getBotKeyBySeed,
    getMangoReimbursementAccount,
    getMangoReimbursementAccountKey,
    getMangoReimbursementGroup,
    getMangoReimbursementRow,
    getTokenConfig,
    getTokenConfigBySymbol,
    nativeToUi,
    redeemAllFromBot,
} from '../../util';
import { createMangoReimbursementAccountIx, mangoReimbursementIx } from '../../instruction';
import { MangoClient } from '@blockworks-foundation/mango-client';
import { MANGO_GROUP_KEY, MANGO_PROGRAM_ID, ZERO_DECIMAL } from '../../constant';

export class MangoPerpBot {
    /*
     * 1. Mango reimbursement
     * 2. Redeem all asset from bot
     */
    static async close(params: CloseBotParams) {
        const payloads: (TransactionPayload | undefined)[] = [];
        const botKey = await getBotKeyBySeed(params.botSeed, params.programId);
        const redeemTokens: string[] = [];

        // 1. Mango reimbursement
        // Skip reimbursement if no reimbursement row or already created reimbursement account
        const reimbursementRow = await getMangoReimbursementRow(params.connection, botKey);
        if (!reimbursementRow) {
            payloads.push(undefined);
        } else {
            const reimbursementAccountKey = await getMangoReimbursementAccountKey(botKey);
            const reimbursementAccount = await getMangoReimbursementAccount(params.connection, reimbursementAccountKey);
            if (reimbursementAccount) {
                payloads.push(undefined);
            } else {
                const reimbursementPayload: TransactionPayload = { instructions: [], signers: [] };
                console.log(`Create reimbursement account ${reimbursementAccountKey.toString()}`);
                reimbursementPayload.instructions.push(
                    createMangoReimbursementAccountIx({
                        botSeed: params.botSeed,
                        reimbursementAccount: reimbursementAccountKey,
                        mangoAccountOwnerAccount: botKey,
                        payer: params.owner,
                        programId: params.programId,
                    }),
                );

                const mangoClient = new MangoClient(params.connection, MANGO_PROGRAM_ID);
                const mangoGroup = await mangoClient.getMangoGroup(MANGO_GROUP_KEY);
                const mangoReimbursementGroup = await getMangoReimbursementGroup(params.connection);
                for (const [tokenIndex, balance] of reimbursementRow.balances.entries()) {
                    if (balance.eq(ZERO_DECIMAL)) {
                        continue;
                    }
                    const tokenConfig = getTokenConfig(mangoGroup.tokens[tokenIndex].mint) as SolanaTokenConfig;
                    const uiBalance = nativeToUi(balance, tokenConfig.decimals);
                    redeemTokens.push(tokenConfig.name);
                    console.log(`Mango reimbursement ${uiBalance} ${tokenConfig.name}`);
                    const [botTokenATA, createBotTokenATAIx] = await createATA(
                        params.connection,
                        botKey,
                        tokenConfig.mintKey,
                        params.owner,
                    );
                    if (createBotTokenATAIx) {
                        reimbursementPayload.instructions.push(createBotTokenATAIx);
                    }
                    const claimMintTokenAccount = await getATAKey(
                        mangoReimbursementGroup.claimTransferDestination,
                        mangoReimbursementGroup.claimMints[tokenIndex],
                    );
                    reimbursementPayload.instructions.push(
                        mangoReimbursementIx({
                            botSeed: params.botSeed,
                            tokenIndex: tokenIndex,
                            indexIntoTable: reimbursementRow.index,
                            vaultAccount: mangoReimbursementGroup.vaults[tokenIndex],
                            tokenAccount: botTokenATA,
                            reimbursementAccount: reimbursementAccountKey,
                            mangoAccountOwnerAccount: botKey,
                            botAccount: botKey,
                            claimMintTokenAccount: claimMintTokenAccount,
                            claimMintAccount: mangoReimbursementGroup.claimMints[tokenIndex],
                            reimbursementTableAccount: mangoReimbursementGroup.table,
                            programId: params.programId,
                        }),
                    );
                }
                payloads.push(reimbursementPayload);
            }
        }

        // 2. Redeem all asset from bot
        const quoteTokenConfig = getTokenConfigBySymbol('USDC') as SolanaTokenConfig;

        const botQuoteATA = await getATAKey(botKey, quoteTokenConfig.mintKey);
        const botQuoteBalance = await getATABalance(params.connection, botQuoteATA);
        console.log(`bot quote balance: ${botQuoteBalance}`);

        if (botQuoteBalance.gt(ZERO_DECIMAL) && redeemTokens.indexOf(quoteTokenConfig.name) == -1) {
            redeemTokens.push(quoteTokenConfig.name);
        }

        if (redeemTokens.length > 0) {
            console.log(`Redeem from bot tokens: ${redeemTokens}`);
            const redeemAllFromBotPayload = await redeemAllFromBot(
                params.connection,
                params.botSeed,
                params.owner,
                params.referrer,
                params.cellAdmin,
                redeemTokens,
                params.programId,
            );
            payloads.push(redeemAllFromBotPayload);
        } else {
            payloads.push(undefined);
        }

        return payloads;
    }
}
