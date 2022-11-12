import { SolanaBot, CancelOrderParams, OrderSide } from '../../../src';
import { solanaBotSeed, solanaConnection, solanaProgramId, solanaWallet } from '../../constant.example';
import { sendSolanaPayload } from '../../../src';

async function cancelOrderExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaProgramId);
    const params: CancelOrderParams = {
        protocol: bot.protocol,
        botSeed: solanaBotSeed,
        side: OrderSide.Ask,
        orderId: '737871607622789435596422580',
        marketKey: bot.market,
        payer: solanaWallet.publicKey,
        programId: solanaProgramId,
    };
    const payload = await SolanaBot.cancelOrder(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
cancelOrderExample();
