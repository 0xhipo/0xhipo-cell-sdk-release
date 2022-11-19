import { NearCellConfig } from '../../../../src';
import { nearContractId } from '../../../constant.example';

async function loadExample() {
    const cellConfig = await NearCellConfig.load(nearContractId);
    console.log(cellConfig);
}
loadExample();
