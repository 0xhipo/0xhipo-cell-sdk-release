import { nearAccountId, nearAccountPrivateKey, nearBotIndex, nearContractId } from '../../constant.example';
import { CancelNearOrderParams, NearBot, NearNetworkId, nearSendTransactionPayload, OrderSide } from '../../../src';
import Decimal from 'decimal.js';

async function cancelOrderExample() {
    const bot = await NearBot.load(nearBotIndex, nearContractId, NearNetworkId.mainnet);
    const params: CancelNearOrderParams = {
        protocol: bot.protocol,
        market: bot.market,
        orderId: '378564',
        botIndex: nearBotIndex,
        contractId: nearContractId,
        // Ref Only params
        // amount: new Decimal(1),
        // side: OrderSide.Bid,
    };
    const payload = await NearBot.cancelOrder(params);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey, NearNetworkId.mainnet);
}
cancelOrderExample();
