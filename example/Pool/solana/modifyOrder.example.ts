import { SolanaPool, ModifyPoolOrderParams, OrderSide, OrderType, sendSolanaPayload } from '../../../src';
import Decimal from 'decimal.js';
import { solanaBotSeed, solanaConnection, solanaProgramId, solanaWallet } from '../../constant.example';

async function modifyOrderExample() {
    const pool = await SolanaPool.load(solanaConnection, solanaBotSeed, solanaProgramId);
    const params: ModifyPoolOrderParams = {
        protocol: pool.protocol,
        existedOrderId: '18446762520453625319632387',
        existedOrderSide: OrderSide.Bid,
        newOrderPrice: new Decimal(1.2),
        newOrderSize: new Decimal(0.02),
        newOrderSide: OrderSide.Bid,
        newOrderType: OrderType.Limit,
        newOrderClientId: '1',
        botSeed: solanaBotSeed,
        marketKey: pool.market,
        payer: solanaWallet.publicKey,
        programId: solanaProgramId,
    };
    const payload = await SolanaPool.modifyOrder(params);
    await sendSolanaPayload(solanaConnection, solanaWallet, payload, false);
}
modifyOrderExample();
