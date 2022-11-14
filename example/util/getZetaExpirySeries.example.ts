import { getZetaExpirySeries } from '../../src';
import { solanaConnection } from '../constant.example';

async function getZetaExpirySeriesExample() {
    const expirySeries = await getZetaExpirySeries(solanaConnection, 'SOL');
    console.log(expirySeries);

    console.log(
        `series 0 active: ${new Date(expirySeries[0].activeTs)}, expiry: ${new Date(expirySeries[0].expiryTs)}`,
    );
    console.log(
        `series 1 active: ${new Date(expirySeries[1].activeTs)}, expiry: ${new Date(expirySeries[1].expiryTs)}`,
    );
}
getZetaExpirySeriesExample();
