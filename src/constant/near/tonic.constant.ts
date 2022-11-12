import { TonicMarketConfig } from '../../type';

export const TONIC_CONTRACT_ID = 'v1.orderbook.near';

export const TONIC_MARKETS: TonicMarketConfig[] = [
    {
        name: 'NEAR/USDC',
        marketId: '2UmzUXYpaZg4vXfFVmD7r8mYUYkKEF19xpjLw7ygDUwp',
        baseSymbol: 'NEAR',
        quoteSymbol: 'USDC',
        orderPriceDecimals: 2,
        orderQuantityDecimals: 2,
    },
    {
        name: 'USN/USDC',
        marketId: 'J5mggeEGCyXVUibvYTe9ydVBrELECRUu23VRk2TwC2is',
        baseSymbol: 'USN',
        quoteSymbol: 'USDC',
        orderPriceDecimals: 4,
        orderQuantityDecimals: 2,
    },
    {
        name: 'NEAR/USN',
        marketId: 'Cefz3vA3yjf8QrjAJgbke4aRbMQU6hbf1M6jRpcBUrdz',
        baseSymbol: 'NEAR',
        quoteSymbol: 'USN',
        orderPriceDecimals: 3,
        orderQuantityDecimals: 2,
    },
    {
        name: 'STNEAR/NEAR',
        marketId: '6x4XNC51pBigBPVEjpp1dmGfRbkxQMrTSudsbAhKwh7h',
        baseSymbol: 'STNEAR',
        quoteSymbol: 'NEAR',
        orderPriceDecimals: 4,
        orderQuantityDecimals: 2,
    },
    {
        name: 'PEM/USDC',
        marketId: 'EQNFsoETbeJshWW4h2sh7bsqJ4Cz2XSHsSDETj1Q2uUb',
        baseSymbol: 'PEM',
        quoteSymbol: 'USDC',
        orderPriceDecimals: 3,
        orderQuantityDecimals: 1,
    },
    {
        name: 'PARAS/USDC',
        marketId: '3Eh8EqMdhAQN2pP3c5pd1zD84PxLMic4XuB75mpv66he',
        baseSymbol: 'PARAS',
        quoteSymbol: 'USDC',
        orderPriceDecimals: 4,
        orderQuantityDecimals: 0,
    },
    {
        name: 'NEARX/NEAR',
        marketId: '2hSL1vwCn2NET49WT3YQuokUzh9bTNQfjNrqW4ewbPV2',
        baseSymbol: 'NEARX',
        quoteSymbol: 'NEAR',
        orderPriceDecimals: 4,
        orderQuantityDecimals: 2,
    },
    {
        name: 'AURORA/USDC',
        marketId: '7Ub1tFH9hUTcS3F4PbU7PPVmXx4u11nQnBPCF3tqJgkV',
        baseSymbol: 'AURORA',
        quoteSymbol: 'USDC',
        orderPriceDecimals: 3,
        orderQuantityDecimals: 2,
    },
];
