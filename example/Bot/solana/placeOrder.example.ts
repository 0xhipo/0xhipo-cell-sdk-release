import { SolanaBot, OrderSide, OrderType, PlaceOrderParams, sendSolanaPayload } from '../../../src';
import Decimal from 'decimal.js';
import { solanaBotSeed, solanaConnection, solanaProgramId, solanaWallet } from '../../constant.example';

async function placeOrderExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaProgramId);
    const params: PlaceOrderParams = {
        price: new Decimal(1),
        quantity: new Decimal(0.01),
        side: OrderSide.Bid,
        orderType: OrderType.Limit,
        protocol: bot.protocol,
        clientId: '1',
        botSeed: solanaBotSeed,
        marketKey: bot.market,
        payer: solanaWallet.publicKey,
        programId: solanaProgramId,
    };
    const payload = await SolanaBot.placeOrder(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
placeOrderExample();
