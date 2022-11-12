import BN from 'bn.js';
import { NearEnvConfig, NearNetworkId } from '../../type';

export const ONE_NEAR_YOCTO = new BN(10).pow(new BN(24));
export const ONE_TGAS = new BN(Math.pow(10, 12));
export const DEFAULT_GAS = ONE_TGAS.muln(300);
export const ZERO_BN = new BN(0);

export const BOT_CONTRACT_STORAGE_NEAR = 4;

export const NEAR_ENV: NearEnvConfig[] = [
    {
        networkId: NearNetworkId.mainnet,
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
    },
    {
        networkId: NearNetworkId.testnet,
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
    },
];
