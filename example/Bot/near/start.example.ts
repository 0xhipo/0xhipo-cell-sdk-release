import { NearBot } from '../../../src/Bot/near';
import { nearAccountId, nearAccountPrivateKey, nearBotIndex, nearContractId } from '../../constant.example';
import { nearSendTransactionPayload } from '../../../src/util';

async function startExample() {
    const payload = await NearBot.start(nearBotIndex, nearContractId);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
}
startExample();
