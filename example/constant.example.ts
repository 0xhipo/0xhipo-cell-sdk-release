import { Keypair, Connection } from '@solana/web3.js';
import { NEAR_CONTRACT_ID, SOLANA_ENV } from '../src';
import base58 from 'bs58';

// Solana constant
export const solanaWallet = Keypair.fromSecretKey(base58.decode('WALLET-SEC-KEY'));

export const solanaDelegate = Keypair.fromSecretKey(base58.decode('DELEGATE-SEC-KEY'));

export const solanaConnection = new Connection('https://api.mainnet-beta.solana.com');

export const solanaBotSeed = base58.decode('BMmmKskvwdoySKrkBZoMoPPeATBzw5Y3EDoLS9HaJ1tg');

export const solanaEnv = SOLANA_ENV.PROD_V2;

// Near constant
export const nearAccountId = 'delegate.near';

export const nearAccountPrivateKey = 'delegate-secret-key';

export const nearBotIndex = 23;

export const nearContractId = NEAR_CONTRACT_ID.PROD;
