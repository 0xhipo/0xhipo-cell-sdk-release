import { SolanaCellConfig } from '../../../../src';
import { solanaConnection, solanaEnv } from '../../../constant.example';

async function loadExample() {
    const cellConfig = await SolanaCellConfig.load(solanaConnection, solanaEnv.programId);
    console.log(cellConfig);
    console.log(`admin: ${cellConfig.admin.toString()}`);
    console.log(`delegate: ${cellConfig.delegate.toString()}`);
}
loadExample();
