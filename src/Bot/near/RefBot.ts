import {
    BotInfo,
    CancelNearOrderParams,
    GetNearBotInfoParams,
    GetNearOpenOrdersParams,
    NearTokenConfig,
    NearTransactionPayload,
    OpenOrder,
    OrderSide,
    PlaceNearOrderParams,
    RefPoolConfig,
} from '../../type';
import {
    getMarketPrice,
    getNearTokenBalance,
    getNearTokenConfigBySymbol,
    getRefPoolConfig,
    nativeToUi,
    nearViewFunction,
    refPointToPrice,
    refPriceToPoint,
    uiToNative,
} from '../../util';
import { Action, functionCall } from 'near-api-js/lib/transaction';
import { DEFAULT_GAS, REF_CONTRACT_ID, ZERO_BN } from '../../constant';
import Decimal from 'decimal.js';

export class RefBot {
    /*
     * 1. create bot (need deposit NEAR to deploy bot contract, see BOT_CONTRACT_STORAGE_NEAR)
     * 2. token Y storage deposit & deposit to bot (if NEAR register wNEAR and deposit NEAR)
     * 3. token X storage deposit (if NEAR register wNEAR)
     * 4. ref storage deposit
     * returns [botIndex, transactionPayloads]
     */
    // static async create(params: CreateNearBotParams): Promise<[number, NearTransactionPayload[]]> {
    //     const payloads: NearTransactionPayload[] = [];
    //     const botIndex = await NearBot.loadAll(params.contractId, params.networkId).then((res) => res.length);
    //     const botContractId = `${botIndex}.${params.contractId}`;
    //     console.log(`Create bot ${botContractId}`);
    //
    //     const poolConfig = getRefPoolConfig(params.market) as RefPoolConfig;
    //     const tokenXConfig = getNearTokenConfigBySymbol(poolConfig.tokenXSymbol) as NearTokenConfig;
    //     const tokenYConfig = getNearTokenConfigBySymbol(poolConfig.tokenYSymbol) as NearTokenConfig;
    //     const wNEARTokenConfig = getNearTokenConfigBySymbol('wNEAR') as NearTokenConfig;
    //
    //     // 1. create bot
    //     payloads.push({
    //         receiverId: params.contractId,
    //         actions: [
    //             functionCall(
    //                 'create_bot',
    //                 {
    //                     deposit_asset_quantity: uiToNative(params.amount, tokenYConfig.decimals).toFixed(),
    //                     lower_price: uiToNative(params.lowerPrice, tokenYConfig.decimals).toFixed(),
    //                     upper_price: uiToNative(params.upperPrice, tokenYConfig.decimals).toFixed(),
    //                     grid_num: params.gridNumber.toNumber(),
    //                     leverage: uiToNative(params.leverage, 2).toNumber(),
    //                     market_id: params.market,
    //                     protocol: botProtocolEnumToStr(params.protocol),
    //                     bot_type: botTypeEnumToStr(params.botType),
    //                     start_price: uiToNative(params.startPrice, tokenYConfig.decimals).toFixed(),
    //                 },
    //                 DEFAULT_GAS,
    //                 ONE_NEAR_YOCTO.muln(BOT_CONTRACT_STORAGE_NEAR),
    //             ),
    //         ],
    //     });
    //
    //     //2. token Y storage deposit & deposit to bot (if NEAR register wNEAR and deposit NEAR)
    //     if (tokenYConfig.symbol == 'NEAR') {
    //         console.log(`Register in wNEAR & deposit ${params.amount} NEAR to bot`);
    //         payloads.push({
    //             receiverId: wNEARTokenConfig.symbol,
    //             actions: [
    //                 functionCall(
    //                     'storage_deposit',
    //                     {
    //                         account_id: botContractId,
    //                         registration_only: true,
    //                     },
    //                     DEFAULT_GAS.divn(2),
    //                     // 0.0125 NEAR
    //                     new BN('12500000000000000000000'),
    //                 ),
    //             ],
    //         });
    //         payloads.push({
    //             receiverId: botContractId,
    //             actions: [
    //                 functionCall('deposit_near', {}, DEFAULT_GAS, ONE_NEAR_YOCTO.mul(decimalToBN(params.amount))),
    //             ],
    //         });
    //     } else {
    //         console.log(`Register in ${tokenYConfig.symbol} & deposit ${params.amount} ${tokenYConfig.symbol} to bot`);
    //         payloads.push({
    //             receiverId: tokenYConfig.accountId,
    //             actions: [
    //                 functionCall(
    //                     'storage_deposit',
    //                     {
    //                         account_id: botContractId,
    //                         registration_only: true,
    //                     },
    //                     DEFAULT_GAS.divn(2),
    //                     // 0.0125 NEAR
    //                     new BN('12500000000000000000000'),
    //                 ),
    //                 functionCall(
    //                     'ft_transfer_call',
    //                     {
    //                         receiver_id: botContractId,
    //                         amount: uiToNative(params.amount, tokenYConfig.decimals).toFixed(),
    //                         msg: botIndex.toString(),
    //                     },
    //                     DEFAULT_GAS.divn(2),
    //                     new BN(1),
    //                 ),
    //             ],
    //         });
    //     }
    //
    //     //3. token X storage deposit (if NEAR register wNEAR)
    //     const tokenXRegisterAccountId =
    //         tokenXConfig.symbol == 'NEAR' ? wNEARTokenConfig.accountId : tokenXConfig.accountId;
    //     console.log(`Register in ${tokenXRegisterAccountId}`);
    //     payloads.push({
    //         receiverId: tokenXRegisterAccountId,
    //         actions: [
    //             functionCall(
    //                 'storage_deposit',
    //                 {
    //                     account_id: botContractId,
    //                     registration_only: true,
    //                 },
    //                 DEFAULT_GAS.divn(2),
    //                 // 0.0125 NEAR
    //                 new BN('12500000000000000000000'),
    //             ),
    //         ],
    //     });
    //
    //     //4. ref storage deposit
    //     console.log(`register in ref`);
    //     payloads.push({
    //         receiverId: REF_CONTRACT_ID,
    //         actions: [
    //             functionCall(
    //                 'storage_deposit',
    //                 {
    //                     account_id: botContractId,
    //                     registration_only: false,
    //                 },
    //                 DEFAULT_GAS,
    //                 // deposit 0.5 NEAR
    //                 ONE_NEAR_YOCTO.divn(2),
    //             ),
    //         ],
    //     });
    //     return [botIndex, payloads];
    // }

    static async getBotInfo(params: GetNearBotInfoParams): Promise<BotInfo> {
        const poolConfig = getRefPoolConfig(params.market) as RefPoolConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(poolConfig.tokenXSymbol) as NearTokenConfig;
        const quoteTokenConfig = getNearTokenConfigBySymbol(poolConfig.tokenYSymbol) as NearTokenConfig;
        const botContractId = `${params.botIndex}.${params.contractId}`;

        const [baseBalance, quoteBalance, baseMarketPrice, quoteMarketPrice] = await Promise.all([
            getNearTokenBalance(baseTokenConfig.symbol, botContractId, params.networkId),
            getNearTokenBalance(quoteTokenConfig.symbol, botContractId, params.networkId),
            getMarketPrice(baseTokenConfig.symbol),
            getMarketPrice(quoteTokenConfig.symbol),
        ]);
        return {
            value: baseBalance.mul(baseMarketPrice).add(quoteBalance.mul(quoteMarketPrice)),
            position: baseBalance,
        };
    }

    static async getOpenOrders(params: GetNearOpenOrdersParams): Promise<OpenOrder[]> {
        const poolConfig = getRefPoolConfig(params.market) as RefPoolConfig;
        const tokenXSymbol = poolConfig.tokenXSymbol == 'NEAR' ? 'wNEAR.Testnet' : poolConfig.tokenXSymbol;
        const tokenYSymbol = poolConfig.tokenYSymbol == 'NEAR' ? 'wNEAR.Testnet' : poolConfig.tokenYSymbol;
        const baseTokenConfig = getNearTokenConfigBySymbol(tokenXSymbol) as NearTokenConfig;
        const quoteTokenConfig = getNearTokenConfigBySymbol(tokenYSymbol) as NearTokenConfig;

        const botContractId = `${params.botIndex}.${params.contractId}`;

        const res = await nearViewFunction(
            'list_active_orders',
            { account_id: botContractId },
            REF_CONTRACT_ID,
            params.networkId,
        );
        console.log(res);

        const openOrders: OpenOrder[] = [];
        for (const i of res) {
            const price = refPointToPrice(new Decimal(i['point']), quoteTokenConfig.decimals, baseTokenConfig.decimals);
            const side: OrderSide = i['sell_token'] == quoteTokenConfig.accountId ? OrderSide.Bid : OrderSide.Ask;
            const size = nativeToUi(
                new Decimal(i['remain_amount']),
                side == OrderSide.Bid ? quoteTokenConfig.decimals : baseTokenConfig.decimals,
            );
            openOrders.push({
                price,
                size: side == OrderSide.Bid ? size.div(price) : size,
                side,
                orderId: i['order_id'],
                clientId: null,
            });
        }
        return openOrders;
    }

    /*
     * If order source token is NEAR, exchange to wNEAR first
     */
    static placeOrder(params: PlaceNearOrderParams): NearTransactionPayload {
        const poolConfig = getRefPoolConfig(params.market) as RefPoolConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(poolConfig.tokenXSymbol) as NearTokenConfig;
        const quoteTokenConfig = getNearTokenConfigBySymbol(poolConfig.tokenYSymbol) as NearTokenConfig;
        const botContractId = `${params.botIndex}.${params.contractId}`;

        const actions: Action[] = [];

        let buyTokenConfig: NearTokenConfig;
        let sellAmount: Decimal;
        let nativeSellAmount: string;
        if (params.side == OrderSide.Bid) {
            buyTokenConfig = baseTokenConfig;
            sellAmount = params.price.mul(params.size);
            nativeSellAmount = uiToNative(sellAmount, quoteTokenConfig.decimals).toFixed();
        } else {
            buyTokenConfig = quoteTokenConfig;
            sellAmount = params.size;
            nativeSellAmount = uiToNative(sellAmount, baseTokenConfig.decimals).toFixed();
        }

        if (
            (params.side == OrderSide.Bid && quoteTokenConfig.symbol == 'NEAR') ||
            (params.side == OrderSide.Ask && baseTokenConfig.symbol == 'NEAR')
        ) {
            actions.push(
                functionCall(
                    'exchange_for_wrapped_near',
                    {
                        amount: nativeSellAmount,
                    },
                    DEFAULT_GAS.divn(2),
                    ZERO_BN,
                ),
            );
        }

        const point = refPriceToPoint(
            params.price,
            quoteTokenConfig.decimals,
            baseTokenConfig.decimals,
            poolConfig.pointDelta,
        );
        console.log(`side: ${params.side}, price: ${params.price}, size: ${params.size}`);
        console.log(
            `buy token: ${buyTokenConfig.symbol}, sell amount: ${nativeSellAmount}, point: ${point.toString()} `,
        );

        actions.push(
            functionCall(
                'place_ref_limit_order',
                {
                    pool_id: params.market,
                    buy_token_id: buyTokenConfig.accountId,
                    sell_amount: nativeSellAmount,
                    point: point.toNumber(),
                },
                DEFAULT_GAS.divn(2),
                ZERO_BN,
            ),
        );

        return {
            receiverId: botContractId,
            actions,
        };
    }

    static cancelOrder(params: CancelNearOrderParams): NearTransactionPayload {
        if (params.amount === undefined) {
            throw `Cancel ref order error: missing parameter amount`;
        } else if (params.side === undefined) {
            throw `Cancel ref order error: missing parameter side`;
        }

        const poolConfig = getRefPoolConfig(params.market) as RefPoolConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(poolConfig.tokenXSymbol) as NearTokenConfig;
        const quoteTokenConfig = getNearTokenConfigBySymbol(poolConfig.tokenYSymbol) as NearTokenConfig;
        const botContractId = `${params.botIndex}.${params.contractId}`;

        const nativeAmount = uiToNative(
            params.amount,
            params.side == OrderSide.Bid ? quoteTokenConfig.decimals : baseTokenConfig.decimals,
        );
        return {
            receiverId: botContractId,
            actions: [
                functionCall(
                    'cancel_ref_limit_order',
                    {
                        order_id: params.orderId,
                        amount: nativeAmount.toFixed(),
                    },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        };
    }
}
