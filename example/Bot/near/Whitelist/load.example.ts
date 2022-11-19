import { NearWhitelist } from '../../../../src';
import { nearContractId } from '../../../constant.example';

async function loadExample() {
    const whitelist = await NearWhitelist.load(nearContractId);
    console.log(whitelist);
}
loadExample();
