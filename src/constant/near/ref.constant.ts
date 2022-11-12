import { RefPoolConfig } from '../../type';

// testnet contract ID
export const REF_CONTRACT_ID = 'dcl.ref-dev.testnet';

export const REF_POOLS: RefPoolConfig[] = [
    // testnet pool
    {
        name: 'REF/wNEAR',
        poolId: 'ref.fakes.testnet|wrap.testnet|400',
        tokenXSymbol: 'REF',
        tokenYSymbol: 'wNEAR',
        pointDelta: 8,
        fee: 400,
    },
    // testnet pool
    {
        name: 'REF/USDT',
        poolId: 'ref.fakes.testnet|usdt.fakes.testnet|2000',
        tokenXSymbol: 'REF',
        tokenYSymbol: 'USDT',
        pointDelta: 40,
        fee: 2000,
    },
];
