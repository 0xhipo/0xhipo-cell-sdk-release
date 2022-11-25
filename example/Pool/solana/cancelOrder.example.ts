import { SolanaBot, CancelOrderParams, OrderSide, SolanaPool } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaEnv, solanaWallet } from '../../constant.example';
import { sendSolanaPayload } from '../../../src';

async function cancelOrderExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: CancelOrderParams = {
        protocol: bot.protocol,
        botSeed: solanaBotSeed,
        side: OrderSide.Bid,
        orderId: '186754837002235499595995',
        marketKey: bot.market,
        payer: solanaWallet.publicKey,
        programId: solanaEnv.programId,
    };
    const payload = await SolanaPool.cancelOrder(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
cancelOrderExample();
