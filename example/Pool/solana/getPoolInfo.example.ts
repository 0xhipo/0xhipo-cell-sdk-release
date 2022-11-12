import { SolanaPool, GetPoolInfoParams } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaProgramId } from '../../constant.example';

async function getPoolInfoExample() {
    const pool = await SolanaPool.load(solanaConnection, solanaBotSeed, solanaProgramId);
    const params: GetPoolInfoParams = {
        protocol: pool.protocol,
        connection: solanaConnection,
        botSeed: solanaBotSeed,
        marketKey: pool.market,
        programId: solanaProgramId,
    };
    const poolInfo = await SolanaPool.getPoolInfo(params);
    console.log(poolInfo);
}
getPoolInfoExample();
