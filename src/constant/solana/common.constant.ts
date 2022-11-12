import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';

export const PID = {
    DEV: new PublicKey('CeLLnpHYVjZSmjfw4syfJwGyAdGtXccZiacJKybFEfHJ'),
    ZETA: new PublicKey('EXQespVxq6d6BTXAU1fE5HyqKG5vxgRoYnq8pHNPVdyA'),
    PROD: new PublicKey('E88JZpoDm5M7xSpgxdQ3aSbiiZgWuLBPgNQSehWcLJM4'),
    POOL: new PublicKey('8QfW1kNu5o25AJU6Htcno6KgnzrT6obiq2mZeR8qaMXp'),
};

export const ADMIN_ACCOUNT = new PublicKey('CeLLkwAYkVtFmej6PvNWXY9c1BzTCgs854nPHXqgECTd');

export const ZERO_DECIMAL = new Decimal(0);
