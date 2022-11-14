import { GetNearBotInfoParams, NearBot, NearNetworkId } from '../../../src';
import { nearBotIndex, nearContractId } from '../../constant.example';

async function getBotInfoExample() {
    const bot = await NearBot.load(nearBotIndex, nearContractId, NearNetworkId.testnet);

    const params: GetNearBotInfoParams = {
        protocol: bot.protocol,
        market: bot.market,
        botIndex: nearBotIndex,
        contractId: nearContractId,
        networkId: NearNetworkId.testnet,
    };
    const botInfo = await NearBot.getBotInfo(params);
    console.log(botInfo);
}
getBotInfoExample();
