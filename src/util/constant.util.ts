import {
    MangoPerpMarketConfig,
    MangoSpotMarketConfig,
    NearEnvConfig,
    NearNetworkId,
    NearTokenConfig,
    RefPoolConfig,
    SerumMarketConfig,
    SolanaTokenConfig,
    TonicMarketConfig,
    ZetaAssetConfig,
    ZetaFutureMarketConfig,
    ZetaPerpMarketConfig,
} from '../type';
import {
    NEAR_ENV,
    NEAR_TOKENS,
    TONIC_MARKETS,
    REF_POOLS,
    SERUM_MARKETS,
    MANGO_SPOT_MARKETS,
    MANGO_PERP_MARKETS,
} from '../constant';
import { SOLANA_TOKENS, ZETA_ASSETS_CONFIG, ZETA_FUTURE_MARKETS, ZETA_PERP_MARKETS } from '../constant';
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

export function getNearTokenConfigByAccountId(accountId: string): NearTokenConfig | undefined {
    return NEAR_TOKENS.find((i) => i.accountId == accountId);
}

export function getTokenConfigBySymbol(tokenSymbol: string): SolanaTokenConfig | undefined {
    return SOLANA_TOKENS.find((i) => i.name == tokenSymbol);
}

export function getTokenConfig(tokenMint: PublicKey): SolanaTokenConfig | undefined {
    return SOLANA_TOKENS.find((i) => i.mintKey.equals(tokenMint));
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

export function getSerumMarketConfig(marketKey: PublicKey): SerumMarketConfig | undefined {
    return SERUM_MARKETS.find((i) => i.address.equals(marketKey));
}

export function getMangoSpotMarketConfig(marketKey: PublicKey): MangoSpotMarketConfig | undefined {
    return MANGO_SPOT_MARKETS.find((i) => i.publicKey.equals(marketKey));
}

export function getMangoPerpMarketConfig(marketKey: PublicKey): MangoPerpMarketConfig | undefined {
    return MANGO_PERP_MARKETS.find((i) => i.publicKey.equals(marketKey));
}
