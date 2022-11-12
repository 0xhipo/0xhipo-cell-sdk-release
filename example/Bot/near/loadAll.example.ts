import { NearBot } from '../../../src/Bot/near';
import { NEAR_CONTRACT_ID } from '../../../src/constant/near';

async function loadAllExample() {
    const bots = await NearBot.loadAll(NEAR_CONTRACT_ID.PROD);
    console.log(bots);
}
loadAllExample();
