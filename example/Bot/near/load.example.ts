import { NearBot, NearNetworkId } from '../../../src';
import { nearBotIndex, nearContractId } from '../../constant.example';

async function loadExample() {
    const bot = await NearBot.load(nearBotIndex, nearContractId, NearNetworkId.testnet);
    console.log(bot);
}
loadExample();
