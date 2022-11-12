import { nearAccountId, nearAccountPrivateKey, nearBotIndex, nearContractId } from '../../constant.example';
import {
    NearBot,
    NearNetworkId,
    nearSendTransactionPayload,
    OrderSide,
    OrderType,
    PlaceNearOrderParams,
} from '../../../src';
import Decimal from 'decimal.js';

async function placeOrderExample() {
    const bot = await NearBot.load(nearBotIndex, nearContractId, NearNetworkId.testnet);
    const params: PlaceNearOrderParams = {
        protocol: bot.protocol,
        market: bot.market,
        price: new Decimal(0.01),
        size: new Decimal(100),
        side: OrderSide.Bid,
        orderType: OrderType.Limit,
        clientId: '1',
        botIndex: nearBotIndex,
        contractId: nearContractId,
    };
    const payload = await NearBot.placeOrder(params);
    await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey, NearNetworkId.testnet);
}
placeOrderExample();
