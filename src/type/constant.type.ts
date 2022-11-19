import { PublicKey } from '@solana/web3.js';

export interface SolanaTokenConfig {
    name: string;
    mintKey: PublicKey;
    decimals: number;
    tokenIndex: number;
    pythPriceKey: PublicKey;
}

export interface ZetaAssetConfig {
    symbol: string;
    groupAccount: PublicKey;
    oracleAccount: PublicKey;
    vaultAccount: PublicKey;
    socializedLossAccount: PublicKey;
    greeksAccount: PublicKey;
    perpSyncQueue: PublicKey;
}

export interface ZetaFutureMarketConfig {
    name: string;
    address: PublicKey;
    leverage: number;
    baseSymbol: string;
    quoteSymbol: string;
    marketIndex: number;
    expiryIndex: number;
    orderPriceDecimals: number;
    orderQuantityDecimals: number;
    greekNodeKey: PublicKey;
    zetaBaseVault: PublicKey;
    zetaQuoteVault: PublicKey;
    // DEX address
    bids: PublicKey;
    asks: PublicKey;
    requestQueue: PublicKey;
    eventQueue: PublicKey;
    baseVault: PublicKey;
    quoteVault: PublicKey;
    baseMint: PublicKey;
    quoteMint: PublicKey;
    vaultOwner: PublicKey;
}

export interface ZetaPerpMarketConfig {
    name: string;
    address: PublicKey;
    leverage: number;
    baseSymbol: string;
    quoteSymbol: string;
    orderPriceDecimals: number;
    orderQuantityDecimals: number;
    zetaBaseVault: PublicKey;
    zetaQuoteVault: PublicKey;
    // DEX address
    bids: PublicKey;
    asks: PublicKey;
    requestQueue: PublicKey;
    eventQueue: PublicKey;
    baseVault: PublicKey;
    quoteVault: PublicKey;
    baseMint: PublicKey;
    quoteMint: PublicKey;
    vaultOwner: PublicKey;
}

export interface TonicMarketConfig {
    name: string;
    marketId: string;
    baseSymbol: string;
    quoteSymbol: string;
    orderPriceDecimals: number;
    orderQuantityDecimals: number;
}

export interface NearTokenConfig {
    symbol: string;
    accountId: string;
    decimals: number;
}

export enum NearNetworkId {
    mainnet = 'mainnet',
    testnet = 'testnet',
}

export interface NearEnvConfig {
    networkId: NearNetworkId;
    nodeUrl: string;
    walletUrl: string;
    helperUrl: string;
}

export interface RefPoolConfig {
    name: string;
    poolId: string;
    tokenXSymbol: string;
    tokenYSymbol: string;
    pointDelta: number;
    fee: number;
}

export interface SerumMarketConfig {
    name: string;
    address: PublicKey;
    baseSymbol: string;
    quoteSymbol: string;
    orderPriceDecimals: number;
    orderQuantityDecimals: number;
    leverage: number;
    baseLotSize: number;
    quoteLotSize: number;
    bids: PublicKey;
    asks: PublicKey;
    requestQueue: PublicKey;
    eventQueue: PublicKey;
    baseVault: PublicKey;
    quoteVault: PublicKey;
    vaultSigner: PublicKey;
}

export interface MangoSpotMarketConfig {
    name: string;
    publicKey: PublicKey;
    orderPriceDecimals: number;
    orderQuantityDecimals: number;
    leverage: number;
    marketIndex: number;
    baseSymbol: string;
    baseDecimals: number;
    quoteDecimals: number;
    baseLotSize: number;
    quoteLotSize: number;
    bidsKey: PublicKey;
    asksKey: PublicKey;
    eventQueueKey: PublicKey;
    requestQueueKey: PublicKey;
    baseVaultKey: PublicKey;
    quoteVaultKey: PublicKey;
    vaultSignerKey: PublicKey;
}

export interface MangoPerpMarketConfig {
    name: string;
    publicKey: PublicKey;
    orderPriceDecimals: number;
    orderQuantityDecimals: number;
    leverage: number;
    marketIndex: number;
    baseSymbol: string;
    baseDecimals: number;
    quoteDecimals: number;
    bidsKey: PublicKey;
    asksKey: PublicKey;
    eventQueueKey: PublicKey;
    mngoVault: PublicKey;
}

export interface SolanaEnvConfig {
    programId: PublicKey;
    adminAccount: PublicKey;
}

export enum SolanaEnvName {
    DEV = 'DEV',
    ZETA = 'ZETA',
    POOL = 'POOL',
    PROD = 'PROD',
    PROD_V2 = 'PROD_V2',
}
