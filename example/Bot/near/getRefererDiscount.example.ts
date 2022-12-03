import { NearBot } from '../../../src';
import { nearContractId } from '../../constant.example';

async function setDelegateExample() {
    const discount = await NearBot.getRefererDiscount('hipodev.near', nearContractId);
    console.log(discount);
}
setDelegateExample();
