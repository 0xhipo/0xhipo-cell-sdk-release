import { GetNearOpenOrdersParams, NearBot, NearNetworkId } from '../../../src';
import { nearBotIndex, nearContractId } from '../../constant.example';

async function getOpenOrdersExample() {
    const bot = await NearBot.load(nearBotIndex, nearContractId, NearNetworkId.testnet);
    const params: GetNearOpenOrdersParams = {
        protocol: bot.protocol,
        market: bot.market,
        botIndex: nearBotIndex,
        contractId: nearContractId,
        networkId: NearNetworkId.testnet,
    };
    const openOrders = await NearBot.getOpenOrders(params);
    console.log(openOrders);
}
getOpenOrdersExample();
