import { CloseNearBotParms, NearBot, NearNetworkId, nearSendTransactionPayload } from '../../../src';
import { nearAccountId, nearAccountPrivateKey, nearBotIndex, nearContractId } from '../../constant.example';

async function closeExample() {
    const bot = await NearBot.load(nearBotIndex, nearContractId);
    const params: CloseNearBotParms = {
        protocol: bot.protocol,
        market: bot.market,
        botIndex: nearBotIndex,
        userAccountId: nearAccountId,
        contractId: nearContractId,
        networkId: NearNetworkId.mainnet,
    };
    const payloads = await NearBot.close(params);
    for (const payload of payloads) {
        await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
    }
}
closeExample();
