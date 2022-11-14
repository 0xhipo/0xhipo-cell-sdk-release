import { NearBot, nearSendTransactionPayload, CancelAllNearOrdersParams } from '../../../src';
import { nearAccountId, nearAccountPrivateKey, nearBotIndex, nearContractId } from '../../constant.example';

async function cancelOrderExample() {
    const bot = await NearBot.load(nearBotIndex, nearContractId);
    const params: CancelAllNearOrdersParams = {
        protocol: bot.protocol,
        market: bot.market,
        botIndex: nearBotIndex,
        contractId: nearContractId,
    };
    const payload = await NearBot.cancelAllOrders(params);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
}
cancelOrderExample();
