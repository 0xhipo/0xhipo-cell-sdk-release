import { SolanaBot, OrderSide, OrderType, PlaceOrderParams, sendSolanaPayload, SolanaPool } from '../../../src';
import Decimal from 'decimal.js';
import { solanaBotSeed, solanaConnection, solanaEnv, solanaWallet } from '../../constant.example';

async function placeOrderExample() {
    const bot = await SolanaBot.load(solanaConnection, solanaBotSeed, solanaEnv.programId);
    const params: PlaceOrderParams = {
        price: new Decimal(10.123),
        quantity: new Decimal(0.01),
        side: OrderSide.Bid,
        orderType: OrderType.Limit,
        protocol: bot.protocol,
        clientId: '1',
        botSeed: solanaBotSeed,
        marketKey: bot.market,
        payer: solanaWallet.publicKey,
        programId: solanaEnv.programId,
    };
    const payload = await SolanaPool.placeOrder(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
placeOrderExample();
