import { SolanaPool, GetPoolInfoParams } from '../../../src';
import {solanaBotSeed, solanaConnection, solanaEnv} from '../../constant.example';

async function getPoolInfoExample() {
    const pool = await SolanaPool.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: GetPoolInfoParams = {
        protocol: pool.protocol,
        connection: solanaConnection,
        botSeed: solanaBotSeed,
        marketKey: pool.market,
        programId: solanaEnv.programId,
    };
    const poolInfo = await SolanaPool.getPoolInfo(params);
    console.log(poolInfo);
}
getPoolInfoExample();
