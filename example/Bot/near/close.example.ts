import { NearBot } from '../../../src/Bot/near';
import { nearAccountId, nearAccountPrivateKey, nearBotIndex, nearContractId } from '../../constant.example';
import { CloseNearBotParms } from '../../../src';
import { nearSendTransactionPayload } from '../../../src/util';

async function closeExample() {
    const bot = await NearBot.load(nearBotIndex, nearContractId);
    const params: CloseNearBotParms = {
        protocol: bot.protocol,
        market: bot.market,
        botIndex: nearBotIndex,
        contractId: nearContractId,
    };
    const payloads = await NearBot.close(params);
    for (const payload of payloads) {
        await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
    }
}
closeExample();
