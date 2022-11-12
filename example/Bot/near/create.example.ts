import {
    BotType,
    CreateNearBotParams,
    NearBot,
    NearNetworkId,
    nearSendTransactionPayload,
    Protocol,
} from '../../../src';
import Decimal from 'decimal.js';
import { nearAccountId, nearAccountPrivateKey, nearContractId } from '../../constant.example';

async function createExample() {
    const params: CreateNearBotParams = {
        protocol: Protocol.Ref,
        amount: new Decimal(100),
        lowerPrice: new Decimal(2),
        upperPrice: new Decimal(3),
        gridNumber: new Decimal(10),
        leverage: new Decimal(1.5),
        market: 'ref.fakes.testnet|usdt.fakes.testnet|2000',
        botType: BotType.Long,
        startPrice: new Decimal(2.3),
        contractId: nearContractId,
        networkId: NearNetworkId.testnet,
    };
    const [botIndex, payloads] = await NearBot.create(params);

    for (const payload of payloads) {
        await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey, NearNetworkId.testnet);
    }
}
createExample();
