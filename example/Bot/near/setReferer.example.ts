import { NearBot, nearSendTransactionPayload } from '../../../src';
import { nearAccountId, nearAccountPrivateKey, nearBotIndex, nearContractId } from '../../constant.example';

async function setDelegateExample() {
    const payload = await NearBot.setReferer('hipodev.near', nearBotIndex, nearContractId);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
}
setDelegateExample();
