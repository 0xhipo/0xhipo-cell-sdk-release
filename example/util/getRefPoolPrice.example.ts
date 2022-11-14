import { getRefPoolPrice } from '../../src';

async function getRefPoolPriceExample() {
    const poolId = 'ref.fakes.testnet|usdt.fakes.testnet|2000';
    const price = await getRefPoolPrice(poolId);
    console.log(price);
}
getRefPoolPriceExample();
