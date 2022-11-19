import { CloseNearMarketParams, NearBot, NearNetworkId, nearSendTransactionPayload } from '../../../src';
import { nearAccountId, nearAccountPrivateKey, nearBotIndex, nearContractId } from '../../constant.example';

async function closeMarketExample() {
    const bot = await NearBot.load(nearBotIndex, nearContractId);
    const params: CloseNearMarketParams = {
        protocol: bot.protocol,
        market: bot.market,
        botIndex: nearBotIndex,
        contractId: nearContractId,
        networkId: NearNetworkId.mainnet,
    };
    const payload = await NearBot.closeMarket(params);
    if (payload) {
        await nearSendTransactionPayload(payload, nearAccountId, nearAccountPrivateKey);
    }
}
closeMarketExample();
