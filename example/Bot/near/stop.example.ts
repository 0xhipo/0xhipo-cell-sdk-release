import { NearBot } from '../../../src/Bot/near';
import { nearAccountId, nearAccountPrivateKey, nearBotIndex, nearContractId } from '../../constant.example';
import { nearSendTransactionPayload } from '../../../src/util';

async function stopExample() {
    const payload = await NearBot.stop(nearBotIndex, nearContractId);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
}
stopExample();
