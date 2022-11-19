import { NearCellConfig, nearSendTransactionPayload, NearSetCellConfigParams } from '../../../../src';
import Decimal from 'decimal.js';
import { nearAccountId, nearAccountPrivateKey, nearContractId } from '../../../constant.example';

async function setExample() {
    const params: NearSetCellConfigParams = {
        delegateAccountId: 'cellfi-dev-delegate.near',
        createBotLine: new Decimal(5000),
        stopBotLine: new Decimal(3000),
        perpFeeRatio: new Decimal(10),
        botOwnerMostPerpFeeRatio: new Decimal(30),
        contractId: nearContractId,
    };
    const payload = NearCellConfig.set(params);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
}
setExample();
