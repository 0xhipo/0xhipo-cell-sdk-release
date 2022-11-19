import { NearBot, nearSendTransactionPayload, NearSetDelegateParams } from '../../../src';
import { nearAccountId, nearAccountPrivateKey, nearBotIndex, nearContractId } from '../../constant.example';

async function setDelegateExample() {
    const params: NearSetDelegateParams = {
        delegateAccountId: 'hipodev.near',
        botIndex: nearBotIndex,
        contractId: nearContractId,
    };
    const payload = await NearBot.setDelegate(params);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
}
setDelegateExample();
