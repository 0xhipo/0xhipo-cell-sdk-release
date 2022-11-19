import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { SolanaEnvConfig, SolanaEnvName } from '../../type';

export const SOLANA_ENV: { [index in SolanaEnvName]: SolanaEnvConfig } = {
    DEV: {
        programId: new PublicKey('CeLLnpHYVjZSmjfw4syfJwGyAdGtXccZiacJKybFEfHJ'),
        adminAccount: new PublicKey('CeLLkwAYkVtFmej6PvNWXY9c1BzTCgs854nPHXqgECTd'),
    },
    ZETA: {
        programId: new PublicKey('EXQespVxq6d6BTXAU1fE5HyqKG5vxgRoYnq8pHNPVdyA'),
        adminAccount: new PublicKey('CeLLkwAYkVtFmej6PvNWXY9c1BzTCgs854nPHXqgECTd'),
    },
    POOL: {
        programId: new PublicKey('8QfW1kNu5o25AJU6Htcno6KgnzrT6obiq2mZeR8qaMXp'),
        adminAccount: new PublicKey('CeLLkwAYkVtFmej6PvNWXY9c1BzTCgs854nPHXqgECTd'),
    },
    PROD: {
        programId: new PublicKey('E88JZpoDm5M7xSpgxdQ3aSbiiZgWuLBPgNQSehWcLJM4'),
        adminAccount: new PublicKey('CeLLkwAYkVtFmej6PvNWXY9c1BzTCgs854nPHXqgECTd'),
    },
    PROD_V2: {
        programId: new PublicKey('8EndYA8H6DBKdrGJNQ6JqckzZAVPMfoYAmaAPwhC9kar'),
        adminAccount: new PublicKey('Aw2CnBU7xrw3UXGqCkjZc1cRfVuR5ZW9dkdFz4VAoA8d'),
    },
};

export const ZERO_DECIMAL = new Decimal(0);
