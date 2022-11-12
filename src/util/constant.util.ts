import {
    NearEnvConfig,
    NearNetworkId,
    NearTokenConfig,
    RefPoolConfig,
    TokenConfig,
    TonicMarketConfig,
    ZetaAssetConfig,
    ZetaFutureMarketConfig,
    ZetaPerpMarketConfig,
} from '../type';
import { NEAR_ENV, NEAR_TOKENS, TONIC_MARKETS, REF_POOLS } from '../constant';
import { SOLANA_TOKEN, ZETA_ASSETS_CONFIG, ZETA_FUTURE_MARKETS, ZETA_PERP_MARKETS } from '../constant';
import { PublicKey } from '@solana/web3.js';

export function getNearEnvConfig(networkId: NearNetworkId): NearEnvConfig | undefined {
    return NEAR_ENV.find((i) => i.networkId == networkId);
}

export function getTonicMarketConfig(marketId: string): TonicMarketConfig | undefined {
    return TONIC_MARKETS.find((i) => i.marketId == marketId);
}

export function getNearTokenConfigBySymbol(symbol: string): NearTokenConfig | undefined {
    return NEAR_TOKENS.find((i) => i.symbol == symbol);
}

export function getTokenConfigBySymbol(tokenSymbol: string): TokenConfig | undefined {
    return Object.values(SOLANA_TOKEN).find((i) => i.name == tokenSymbol);
}

export function getZetaAssetConfigBySymbol(symbol: string): ZetaAssetConfig | undefined {
    return ZETA_ASSETS_CONFIG.find((i) => i.symbol == symbol);
}

export function getZetaFutureMarketConfig(publicKey: PublicKey): ZetaFutureMarketConfig | undefined {
    return ZETA_FUTURE_MARKETS.find((i) => i.address.equals(publicKey));
}

export function getZetaPerpMarketConfig(marketKey: PublicKey): ZetaPerpMarketConfig | undefined {
    return ZETA_PERP_MARKETS.find((i) => i.address.equals(marketKey));
}

export function getRefPoolConfig(poolId: string): RefPoolConfig | undefined {
    return REF_POOLS.find((i) => i.poolId == poolId);
}
