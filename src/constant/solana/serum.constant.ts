import { PublicKey } from '@solana/web3.js';
import { SerumMarketConfig } from '../../type';

export const SERUM_PROGRAM_ID = new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX');

export const SERUM_MARKETS: SerumMarketConfig[] = [
    {
        name: 'SOL/USDC',
        address: new PublicKey('8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh6'),
        baseSymbol: 'SOL',
        quoteSymbol: 'USDC',
        orderPriceDecimals: 3,
        orderQuantityDecimals: 3,
        leverage: 1,
        baseLotSize: 1000000,
        quoteLotSize: 1,
        bids: new PublicKey('5jWUncPNBMZJ3sTHKmMLszypVkoRK6bfEQMQUHweeQnh'),
        asks: new PublicKey('EaXdHx7x3mdGA38j5RSmKYSXMzAFzzUXCLNBEDXDn1d5'),
        requestQueue: new PublicKey('CPjXDcggXckEq9e4QeXUieVJBpUNpLEmpihLpg5vWjGF'),
        eventQueue: new PublicKey('8CvwxZ9Db6XbLD46NZwwmVDZZRDy7eydFcAGkXKh9axa'),
        baseVault: new PublicKey('CKxTHwM9fPMRRvZmFnFoqKNd9pQR21c5Aq9bh5h9oghX'),
        quoteVault: new PublicKey('6A5NHCj1yF6urc9wZNe6Bcjj4LVszQNj5DwAWG97yzMu'),
        vaultSigner: new PublicKey('CTz5UMLQm2SRWHzQnU62Pi4yJqbNGjgRBHqqp6oDHfF7'),
    },
];
