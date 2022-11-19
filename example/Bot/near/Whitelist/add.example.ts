import { nearSendTransactionPayload, NearWhitelist } from '../../../../src';
import { nearAccountId, nearAccountPrivateKey, nearContractId } from '../../../constant.example';

async function addExample() {
    const whitelist = ['cellfi01.near'];
    const payload = NearWhitelist.add(whitelist, nearContractId);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
}
addExample();
