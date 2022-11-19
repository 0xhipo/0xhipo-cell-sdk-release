import { getMangoReimbursementRow } from '../../src';
import { solanaConnection } from '../constant.example';
import { PublicKey } from '@solana/web3.js';

async function getMangoReimbursementRowExample() {
    const botKey = new PublicKey('H32Tg76vg8Kjrze6vBFtiaUSsut9rmDdLXvrwxAHQfyn');
    const row = await getMangoReimbursementRow(solanaConnection, botKey);
    console.log(row);
}
getMangoReimbursementRowExample();
