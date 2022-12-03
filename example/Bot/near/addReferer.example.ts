import { NearBot, nearSendTransactionPayload } from '../../../src';
import { nearAccountId, nearAccountPrivateKey, nearContractId } from '../../constant.example';
import Decimal from 'decimal.js';

async function setDelegateExample() {
    const payload = await NearBot.addReferer('hipodev.near', new Decimal(0.1), nearContractId);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
}
setDelegateExample();
