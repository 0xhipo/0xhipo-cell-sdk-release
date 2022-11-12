import { NearTokenConfig } from '../../type';

export const NEAR_TOKENS: NearTokenConfig[] = [
    { symbol: 'NEAR', accountId: 'NEAR', decimals: 24 },
    {
        symbol: 'USDC',
        accountId: 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
        decimals: 6,
    },
    {
        symbol: 'USN',
        accountId: 'usn',
        decimals: 18,
    },
    {
        symbol: 'STNEAR',
        accountId: 'meta-pool',
        decimals: 24,
    },
    {
        symbol: 'PEM',
        accountId: 'token.pembrock.near',
        decimals: 18,
    },
    {
        symbol: 'PARAS',
        accountId: 'token.paras.near',
        decimals: 18,
    },
    {
        symbol: 'NEARX',
        accountId: 'v2-nearx.stader-labs.near',
        decimals: 24,
    },
    {
        symbol: 'AURORA',
        accountId: 'aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near',
        decimals: 18,
    },
    {
        symbol: 'AURORA',
        accountId: 'aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near',
        decimals: 18,
    },
    // testnet token
    {
        symbol: 'REF',
        accountId: 'ref.fakes.testnet',
        decimals: 18,
    },
    // testnet token
    {
        symbol: 'wNEAR',
        accountId: 'wrap.testnet',
        decimals: 24,
    },
    // testnet token
    {
        symbol: 'USDT',
        accountId: 'usdt.fakes.testnet',
        decimals: 6,
    },
];
