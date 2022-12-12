import { SpinPerpMarketConfig, SpinSpotMarketConfig } from '../../type';

export const SPIN_SPOT_CONTRACT_ID = 'spot.spin-fi.near';
export const SPIN_PERP_CONTRACT_ID = 'v2_0_2.perp.spin-fi.near';

export const SPIN_SPOT_MARKETS: SpinSpotMarketConfig[] = [
    {
        name: 'NEAR/USDC',
        marketId: '1',
        baseSymbol: 'NEAR',
        quoteSymbol: 'USDC',
        orderPriceDecimals: 3,
        orderQuantityDecimals: 2,
    },
];

export const SPIN_PERP_MARKETS: SpinPerpMarketConfig[] = [
    {
        name: 'NEAR-PERP',
        marketId: '1',
        leverage: 10,
        baseSymbol: 'NEAR',
        quoteSymbol: 'USDC',
        orderPriceDecimals: 3,
        orderQuantityDecimals: 2,
    },
];
