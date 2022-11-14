import { NearBot, NearNetworkId } from '../../../src';
import { nearContractId } from '../../constant.example';

async function loadAllExample() {
    const bots = await NearBot.loadAll(nearContractId, NearNetworkId.testnet);
    console.log(bots);
}
loadAllExample();
