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
        protocol: Protocol.Tonic,
        baseTokenBalance: new Decimal(1),
        quoteTokenBalance: new Decimal(1),
        lowerPrice: new Decimal(2),
        upperPrice: new Decimal(3.5),
        gridNumber: new Decimal(10),
        leverage: new Decimal(1),
        market: '7Ub1tFH9hUTcS3F4PbU7PPVmXx4u11nQnBPCF3tqJgkV',
        botType: BotType.Long,
        startPrice: new Decimal(2.3),
        contractId: nearContractId,
        networkId: NearNetworkId.mainnet,
    };
    const [botIndex, payloads] = await NearBot.create(params);

    for (const payload of payloads) {
        await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey, NearNetworkId.mainnet);
    }
}
createExample();
