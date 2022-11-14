import Decimal from 'decimal.js';
import { Action, functionCall, signTransaction } from 'near-api-js/lib/transaction';
import {
    NearAccountState,
    NearEnvConfig,
    NearNetworkId,
    NearTokenConfig,
    NearTransactionPayload,
    RefPoolConfig,
} from '../type';
import { DEFAULT_GAS, REF_CONTRACT_ID, ZERO_BN } from '../constant';
import { nativeToUi, refPointToPrice, uiToNative } from './number.util';
import { getNearEnvConfig, getNearTokenConfigBySymbol, getRefPoolConfig } from './constant.util';
import { FinalExecutionOutcome, JsonRpcProvider } from 'near-api-js/lib/providers';
import { KeyPair, keyStores, Near } from 'near-api-js';
import BN from 'bn.js';
import { baseDecode } from 'borsh';

export function redeemFromTonicAction(tokenSymbol: string, amount: Decimal): Action {
    const tokenConfig = getNearTokenConfigBySymbol(tokenSymbol) as NearTokenConfig;
    if (tokenConfig.symbol == 'NEAR') {
        return functionCall(
            'withdraw_near_from_tonic',
            {
                withdraw_amount: uiToNative(new Decimal(amount), tokenConfig.decimals).toFixed(),
            },
            DEFAULT_GAS.divn(2),
            ZERO_BN,
        );
    } else {
        return functionCall(
            'withdraw_ft_from_tonic',
            {
                token_id: tokenConfig.accountId,
                withdraw_amount: uiToNative(new Decimal(amount), tokenConfig.decimals).toFixed(),
            },
            DEFAULT_GAS.divn(2),
            ZERO_BN,
        );
    }
}

export async function getNearTokenBalance(
    tokenSymbol: string,
    accountId: string,
    networkId = NearNetworkId.mainnet,
): Promise<Decimal> {
    const tokenConfig = getNearTokenConfigBySymbol(tokenSymbol) as NearTokenConfig;
    if (tokenConfig.symbol == 'NEAR') {
        const accountState = await nearViewAccount(accountId, networkId);
        return nativeToUi(new Decimal(accountState.amount), tokenConfig.decimals);
    } else {
        return nearViewFunction('ft_balance_of', { account_id: accountId }, tokenConfig.accountId, networkId).then(
            (res) => nativeToUi(new Decimal(res), tokenConfig.decimals),
        );
    }
}

export async function nearSendTransactionPayload(
    payload: NearTransactionPayload,
    accountId: string,
    privateKeyStr: string,
    networkId: NearNetworkId = NearNetworkId.mainnet,
): Promise<FinalExecutionOutcome> {
    const nearEnv = getNearEnvConfig(networkId) as NearEnvConfig;
    const keyPair = KeyPair.fromString(privateKeyStr);
    const keyStore = new keyStores.InMemoryKeyStore();
    await keyStore.setKey(networkId, accountId, keyPair);
    const near = new Near({ ...nearEnv, keyStore });
    const account = await near.account(accountId);

    const accessKeyInfo = await account.findAccessKey(account.accountId, payload.actions);
    const { accessKey } = accessKeyInfo;

    const block = await account.connection.provider.block({ finality: 'final' });
    const blockHash = block.header.hash;
    const nonce = accessKey.nonce.add(new BN(1));

    const [_, signedTx] = await signTransaction(
        payload.receiverId,
        nonce,
        payload.actions,
        baseDecode(blockHash),
        account.connection.signer,
        account.accountId,
        account.connection.networkId,
    );
    const outcome = await account.connection.provider.sendTransaction(signedTx);
    console.log(`Signature: ${outcome.transaction['hash']}`);
    return outcome;
}

export async function nearViewFunction(
    methodName: string,
    args: any,
    accountId: string,
    networkId: NearNetworkId = NearNetworkId.mainnet,
) {
    const nearEnv = getNearEnvConfig(networkId) as NearEnvConfig;
    const provider = new JsonRpcProvider({ url: nearEnv.nodeUrl });
    return provider
        .query({
            request_type: 'call_function',
            finality: 'optimistic',
            account_id: accountId,
            method_name: methodName,
            args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
        })
        .then((res) => JSON.parse(Buffer.from(res['result']).toString()));
}

export async function nearViewAccount(
    accountId: string,
    networkId: NearNetworkId = NearNetworkId.mainnet,
): Promise<NearAccountState> {
    const nearEnv = getNearEnvConfig(networkId) as NearEnvConfig;
    const provider = new JsonRpcProvider({ url: nearEnv.nodeUrl });
    return provider
        .query({
            account_id: accountId,
            finality: 'optimistic',
            request_type: 'view_account',
        })
        .then((res) => res as NearAccountState);
}

/*
 * Token X / Token Y
 * e.g. REF | USDT pool, get REF price quoted by USDT
 */
export async function getRefPoolPrice(poolId: string, networkId = NearNetworkId.testnet) {
    const poolConfig = getRefPoolConfig(poolId) as RefPoolConfig;
    const tokenXConfig = getNearTokenConfigBySymbol(poolConfig.tokenXSymbol) as NearTokenConfig;
    const tokenYConfig = getNearTokenConfigBySymbol(poolConfig.tokenYSymbol) as NearTokenConfig;
    const poolInfo = await nearViewFunction('get_pool', { pool_id: poolId }, REF_CONTRACT_ID, networkId);
    return refPointToPrice(new Decimal(poolInfo['current_point']), tokenYConfig.decimals, tokenXConfig.decimals);
}
