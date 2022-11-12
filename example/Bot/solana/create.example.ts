import { SolanaBot, BotType, CreateBotParams, Protocol, sendSolanaPayload } from '../../../src';
import base58 from 'bs58';
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { solanaConnection, solanaProgramId, solanaWallet } from '../../constant.example';

async function createExample() {
    const createBotParams: CreateBotParams = {
        botOwner: solanaWallet.publicKey,
        depositAssetQuantity: new Decimal(10),
        lowerPrice: new Decimal(1.5),
        upperPrice: new Decimal(2.5),
        gridNum: new Decimal(10),
        leverage: new Decimal(1.5),
        marketKey: new PublicKey('JE6d41JRokZAMUEAznV8JP4h7i6Ain6CyJrQuweRipFU'),
        protocol: Protocol.ZetaPerp,
        botType: BotType.Neutral,
        startPrice: new Decimal(2.4),
        programId: solanaProgramId,
        stopTopRatio: new Decimal(0),
        stopBottomRatio: new Decimal(0),
        trigger: false,
    };

    const [botSeed, dexAccountKey, orderOwnerKey, payload] = await SolanaBot.create(createBotParams);

    console.log(`Bot seed: ${base58.encode(botSeed)}`);
    console.log(`Dex account key: ${dexAccountKey.toString()}`);
    console.log(`Order owner key: ${orderOwnerKey.toString()}`);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}

createExample();
