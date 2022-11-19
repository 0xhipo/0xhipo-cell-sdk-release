import { nearSendTransactionPayload, NearWhitelist } from '../../../../src';
import { nearAccountId, nearAccountPrivateKey, nearContractId } from '../../../constant.example';

async function removeExample() {
    const whitelist = ['cellfi01.near'];
    const payload = NearWhitelist.remove(whitelist, nearContractId);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
}
removeExample();
