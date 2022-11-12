import { NearBot } from '../../../src/Bot/near';
import { GetNearBotInfoParams, Protocol } from '../../../src';
import { nearBotIndex, nearContractId } from '../../constant.example';

async function getBotInfoExample() {
    const bot = await NearBot.load(nearBotIndex, nearContractId);

    const params: GetNearBotInfoParams = {
        protocol: Protocol.Tonic,
        market: bot.market,
        botIndex: nearBotIndex,
        contractId: nearContractId,
    };
    const botInfo = await NearBot.getBotInfo(params);
    console.log(botInfo);
}
getBotInfoExample();
