import { SolanaBot, CancelOrderParams, OrderSide } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaEnv, solanaWallet } from '../../constant.example';
import { sendSolanaPayload } from '../../../src';

async function cancelOrderExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: CancelOrderParams = {
        protocol: bot.protocol,
        botSeed: solanaBotSeed,
        side: OrderSide.Ask,
        orderId: '368934881474191032579582',
        marketKey: bot.market,
        payer: solanaWallet.publicKey,
        programId: solanaEnv.programId,
    };
    const payload = await SolanaBot.cancelOrder(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
cancelOrderExample();
