import { getMarketPrice } from '../../src';

async function getMarketPriceExample() {
    const price = await getMarketPrice('ETH');
    console.log(price);
}
getMarketPriceExample();
