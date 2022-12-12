import { PublicKey } from '@solana/web3.js';
import { SolanaTokenConfig } from '../../type';

export const PYTH_PRICE_KEY = {
    USDC: new PublicKey('Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD'),
    BTC: new PublicKey('GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU'),
    COPE: new PublicKey('9xYBiDWYsh2fHzpsz3aaCnNHCKWBNtfEDLtU6kS4aFD9'),
    ETH: new PublicKey('JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB'),
    MNGO: new PublicKey('79wm3jjcPr6RaNQ4DGvP5KxG1mNd3gEBsg6FsNVFezK4'),
    RAY: new PublicKey('AnLf8tVYCM816gmBjiy8n53eXKKEDydT5piYjjQDPgTB'),
    SOL: new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    SRM: new PublicKey('3NBReDRTLKMQEKiLD5tGcx4kXbTf88b7f2xLS9UuGjym'),
    FTT: new PublicKey('8JPJJkmDScpcNmBRKGZuPuG2GYAveQgP3t5gFuMymwvF'),
    LUNA: new PublicKey('5bmWuR1dgP4avtGYMNKLuxumZTVKGgoN2BCMXWDNL9nY'),
    BNB: new PublicKey('4CkQJBxhU8EZ2UjhigbtdaPbpTe6mqf811fipYBFbSYN'),
    AVAX: new PublicKey('Ax9ujW5B9oqcv59N8m6f1BpTBq2rGeGaBcpKjC5UYsXU'),
    USDT: new PublicKey('3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL'),
    MSOL: new PublicKey('E4v1BBgoso9s64TQvmyownAVJbhbEPGyzA3qn4n46qj9'),
    GMT: new PublicKey('DZYZkJcFJThN9nZy4nK3hrHra1LaWeiyoZ9SMdLFEFpY'),
    ADA: new PublicKey('3pyn4svBbxJ9Wnn3RVeafyLWfzie6yC5eTig2S62v9SC'),
    stSOL: new PublicKey('Bt1hEbY62aMriY1SyQqbeZbm8VmSbQVGBFzSzMuVNWzN'),
    ARB: PublicKey.default,
};

export const SOLANA_TOKENS: SolanaTokenConfig[] = [
    {
        name: 'USDC',
        mintKey: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        decimals: 6,
        tokenIndex: 0,
        pythPriceKey: PYTH_PRICE_KEY.USDC,
    },
    {
        name: 'MNGO',
        mintKey: new PublicKey('MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'),
        decimals: 6,
        tokenIndex: 1,
        pythPriceKey: PYTH_PRICE_KEY.MNGO,
    },
    {
        name: 'BTC',
        mintKey: new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'),
        decimals: 6,
        tokenIndex: 2,
        pythPriceKey: PYTH_PRICE_KEY.BTC,
    },
    {
        name: 'ETH',
        mintKey: new PublicKey('2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk'),
        decimals: 6,
        tokenIndex: 3,
        pythPriceKey: PYTH_PRICE_KEY.ETH,
    },
    {
        name: 'SOL',
        mintKey: new PublicKey('So11111111111111111111111111111111111111112'),
        decimals: 9,
        tokenIndex: 4,
        pythPriceKey: PYTH_PRICE_KEY.SOL,
    },
    {
        name: 'USDT',
        mintKey: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
        decimals: 6,
        tokenIndex: 5,
        pythPriceKey: PYTH_PRICE_KEY.USDT,
    },
    {
        name: 'SRM',
        mintKey: new PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'),
        decimals: 6,
        tokenIndex: 6,
        pythPriceKey: PYTH_PRICE_KEY.SRM,
    },
    {
        name: 'RAY',
        mintKey: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'),
        decimals: 6,
        tokenIndex: 7,
        pythPriceKey: PYTH_PRICE_KEY.RAY,
    },
    {
        name: 'COPE',
        mintKey: new PublicKey('8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh'),
        decimals: 6,
        tokenIndex: 8,
        pythPriceKey: PYTH_PRICE_KEY.COPE,
    },
    {
        name: 'FTT',
        mintKey: new PublicKey('AGFEad2et2ZJif9jaGpdMixQqvW5i81aBdvKe7PHNfz3'),
        decimals: 6,
        tokenIndex: 9,
        pythPriceKey: PYTH_PRICE_KEY.FTT,
    },
    {
        name: 'MSOL',
        mintKey: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'),
        decimals: 9,
        tokenIndex: 10,
        pythPriceKey: PYTH_PRICE_KEY.MSOL,
    },
    {
        name: 'BNB',
        mintKey: new PublicKey('9gP2kCy3wA1ctvYWQk75guqXuHfrEomqydHLtcTCqiLa'),
        decimals: 8,
        tokenIndex: 11,
        pythPriceKey: PYTH_PRICE_KEY.BNB,
    },
    {
        name: 'AVAX',
        mintKey: new PublicKey('KgV1GvrHQmRBY8sHQQeUKwTm2r2h8t4C8qt12Cw1HVE'),
        decimals: 8,
        tokenIndex: 12,
        pythPriceKey: PYTH_PRICE_KEY.AVAX,
    },
    {
        name: 'LUNA',
        mintKey: new PublicKey('F6v4wfAdJB8D8p77bMXZgYt8TDKsYxLYxH5AFhUkYx9W'),
        decimals: 6,
        tokenIndex: 13,
        pythPriceKey: PYTH_PRICE_KEY.LUNA,
    },
    {
        name: 'GMT',
        mintKey: new PublicKey('7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx'),
        decimals: 9,
        tokenIndex: 14,
        pythPriceKey: PYTH_PRICE_KEY.GMT,
    },
    {
        name: 'wETH',
        mintKey: new PublicKey('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs'),
        decimals: 8,
        tokenIndex: 15,
        pythPriceKey: PYTH_PRICE_KEY.ETH,
    },
    {
        name: 'stSOL',
        mintKey: new PublicKey('7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj'),
        decimals: 9,
        tokenIndex: 16,
        pythPriceKey: PYTH_PRICE_KEY.stSOL,
    },
    {
        name: 'ARB',
        mintKey: new PublicKey('9tzZzEHsKnwFL1A3DyFJwj36KnZj3gZ7g4srWp9YTEoh'),
        decimals: 6,
        tokenIndex: 17,
        pythPriceKey: PYTH_PRICE_KEY.ARB,
    },
];
