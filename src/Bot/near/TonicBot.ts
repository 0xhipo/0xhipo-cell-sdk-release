import {
    BotInfo,
    CancelAllNearOrdersParams,
    CancelNearOrderParams,
    CloseNearBotParms,
    CreateNearBotParams,
    GetNearBotInfoParams,
    GetNearOpenOrdersParams,
    NearTokenConfig,
    NearTransactionPayload,
    OpenOrder,
    OrderSide,
    PlaceNearOrderParams,
    TonicMarketConfig,
} from '../../type';
import { NearBot } from './index';
import { functionCall } from 'near-api-js/lib/transaction';
import {
    botProtocolEnumToStr,
    botTypeEnumToStr,
    getMarketPrice,
    getNearTokenBalance,
    nativeToUi,
    nearViewFunction,
    redeemFromTonicAction,
    tonicOrderSideTransform,
    tonicOrderTypeTransform,
    uiToNative,
    getNearTokenConfigBySymbol,
    getTonicMarketConfig,
} from '../../util';
import {
    BOT_CONTRACT_STORAGE_NEAR,
    DEFAULT_GAS,
    ONE_NEAR_YOCTO,
    TONIC_CONTRACT_ID,
    ZERO_BN,
} from '../../constant';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import { ZERO_DECIMAL } from '../../constant';

export class TonicBot {
    /*
     * 1. create bot (need deposit NEAR to deploy bot contract, see BOT_CONTRACT_STORAGE_NEAR)
     * 2. quote token storage deposit & deposit to bot
     * 3. base token storage deposit (if not NEAR)
     * 4. tonic storage deposit
     * 5. deposit to tonic
     * returns [botIndex, transactionPayloads]
     */
    static async create(params: CreateNearBotParams): Promise<[number, NearTransactionPayload[]]> {
        const payloads: NearTransactionPayload[] = [];
        const botIndex = await NearBot.loadAll(params.contractId).then((res) => res.length);
        const botContractId = `${botIndex}.${params.contractId}`;
        console.log(`Create bot ${botContractId}`);

        const marketConfig = getTonicMarketConfig(params.market) as TonicMarketConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(marketConfig.baseSymbol) as NearTokenConfig;
        const quoteTokenConfig = getNearTokenConfigBySymbol(marketConfig.quoteSymbol) as NearTokenConfig;

        // 1. create bot
        payloads.push({
            receiverId: params.contractId,
            actions: [
                functionCall(
                    'create_bot',
                    {
                        deposit_asset_quantity: uiToNative(params.amount, quoteTokenConfig.decimals).toFixed(),
                        lower_price: uiToNative(params.lowerPrice, quoteTokenConfig.decimals).toFixed(),
                        upper_price: uiToNative(params.upperPrice, quoteTokenConfig.decimals).toFixed(),
                        grid_num: params.gridNumber.toNumber(),
                        leverage: uiToNative(params.leverage, 2).toNumber(),
                        market_id: params.market,
                        protocol: botProtocolEnumToStr(params.protocol),
                        bot_type: botTypeEnumToStr(params.botType),
                        start_price: uiToNative(params.startPrice, quoteTokenConfig.decimals).toFixed(),
                    },
                    DEFAULT_GAS,
                    ONE_NEAR_YOCTO.muln(BOT_CONTRACT_STORAGE_NEAR),
                ),
            ],
        });

        // 2. quote token storage deposit & deposit to bot
        //  TODO NEAR as quote token
        console.log(`Register & deposit ${params.amount} ${quoteTokenConfig.symbol} to bot`);
        payloads.push({
            receiverId: quoteTokenConfig.accountId,
            actions: [
                functionCall(
                    'storage_deposit',
                    {
                        account_id: botContractId,
                        registration_only: true,
                    },
                    DEFAULT_GAS.divn(2),
                    // 0.0125 NEAR
                    new BN('12500000000000000000000'),
                ),
                functionCall(
                    'ft_transfer_call',
                    {
                        receiver_id: botContractId,
                        amount: uiToNative(params.amount, quoteTokenConfig.decimals).toFixed(),
                        msg: botIndex.toString(),
                    },
                    DEFAULT_GAS.divn(2),
                    new BN(1),
                ),
            ],
        });

        // 3. base token storage deposit (if not NEAR)
        if (baseTokenConfig.symbol != 'NEAR') {
            console.log(`Register in ${baseTokenConfig.symbol}`);
            payloads.push({
                receiverId: baseTokenConfig.accountId,
                actions: [
                    functionCall(
                        'storage_deposit',
                        {
                            account_id: botContractId,
                            registration_only: true,
                        },
                        DEFAULT_GAS.divn(2),
                        // 0.0125 NEAR
                        new BN('12500000000000000000000'),
                    ),
                ],
            });
        }

        // 4. tonic storage deposit
        console.log(`Register in tonic`);
        payloads.push({
            receiverId: TONIC_CONTRACT_ID,
            actions: [
                functionCall(
                    'storage_deposit',
                    {
                        account_id: botContractId,
                        registration_only: false,
                    },
                    DEFAULT_GAS,
                    // deposit 0.1 NEAR
                    ONE_NEAR_YOCTO.divn(10),
                ),
            ],
        });

        // 5. deposit to tonic
        console.log(`Deposit ${params.amount} ${quoteTokenConfig.symbol} to tonic`);
        payloads.push({
            receiverId: botContractId,
            actions: [
                functionCall(
                    'deposit_ft_to_tonic',
                    {
                        token_id: quoteTokenConfig.accountId,
                        deposit_amount: uiToNative(params.amount, 6).toFixed(),
                    },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        });
        return [botIndex, payloads];
    }

    static async getBotInfo(params: GetNearBotInfoParams): Promise<BotInfo> {
        const marketConfig = getTonicMarketConfig(params.market) as TonicMarketConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(marketConfig.baseSymbol) as NearTokenConfig;
        const quoteTokenConfig = getNearTokenConfigBySymbol(marketConfig.quoteSymbol) as NearTokenConfig;

        const botContractId = `${params.botIndex}.${params.contractId}`;
        const tonicBalances = await nearViewFunction('get_balances', { account_id: botContractId }, TONIC_CONTRACT_ID);

        // [ft:a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near, 1000000]
        const tonicBaseBalance = tonicBalances.find((i) => i[0].replace('ft:', '') == baseTokenConfig.accountId);
        const tonicQuoteBalance = tonicBalances.find((i) => i[0].replace('ft:', '') == quoteTokenConfig.accountId);
        const baseBalance = tonicBaseBalance
            ? nativeToUi(new Decimal(tonicBaseBalance[1]), baseTokenConfig.decimals)
            : ZERO_DECIMAL;
        const quoteBalance = tonicQuoteBalance
            ? nativeToUi(new Decimal(tonicQuoteBalance[1]), quoteTokenConfig.decimals)
            : ZERO_DECIMAL;

        const basePrice = await getMarketPrice(baseTokenConfig.symbol);

        return {
            value: basePrice.mul(baseBalance).add(quoteBalance),
            position: baseBalance,
        };
    }

    static async getOpenOrders(params: GetNearOpenOrdersParams): Promise<OpenOrder[]> {
        const marketConfig = getTonicMarketConfig(params.market) as TonicMarketConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(marketConfig.baseSymbol) as NearTokenConfig;
        const quoteTokenConfig = getNearTokenConfigBySymbol(marketConfig.quoteSymbol) as NearTokenConfig;

        const botContractId = `${params.botIndex}.${params.contractId}`;
        return nearViewFunction(
            'get_open_orders',
            {
                market_id: params.market,
                account_id: botContractId,
            },
            TONIC_CONTRACT_ID,
        ).then((openOrders) =>
            openOrders.map((openOrder) => {
                return {
                    price: nativeToUi(new Decimal(openOrder['limit_price']), quoteTokenConfig.decimals),
                    size: nativeToUi(new Decimal(openOrder['open_qty']), baseTokenConfig.decimals),
                    side: openOrder['side'] == 'Buy' ? OrderSide.Bid : OrderSide.Ask,
                    orderId: openOrder['id'],
                    clientId: openOrder['client_id'].toString(),
                };
            }),
        );
    }

    static placeOrder(params: PlaceNearOrderParams): NearTransactionPayload {
        const marketConfig = getTonicMarketConfig(params.market) as TonicMarketConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(marketConfig.baseSymbol) as NearTokenConfig;
        const quoteTokenConfig = getNearTokenConfigBySymbol(marketConfig.quoteSymbol) as NearTokenConfig;

        const botContractId = `${params.botIndex}.${params.contractId}`;
        return {
            receiverId: botContractId,
            actions: [
                functionCall(
                    'place_tonic_limit_order',
                    {
                        market_id: params.market,
                        limit_price: uiToNative(params.price, quoteTokenConfig.decimals).toFixed(),
                        quantity: uiToNative(params.size, baseTokenConfig.decimals).toFixed(),
                        side: tonicOrderSideTransform(params.side),
                        order_type: tonicOrderTypeTransform(params.orderType),
                        client_id: Number(params.clientId),
                    },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        };
    }

    static cancelOrder(params: CancelNearOrderParams): NearTransactionPayload {
        const botContractId = `${params.botIndex}.${params.contractId}`;
        return {
            receiverId: botContractId,
            actions: [
                functionCall(
                    'cancel_tonic_limit_order',
                    {
                        order_id: params.orderId,
                        market_id: params.market,
                    },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        };
    }

    static cancelAllOrders(params: CancelAllNearOrdersParams): NearTransactionPayload {
        const botContractId = `${params.botIndex}.${params.contractId}`;
        return {
            receiverId: botContractId,
            actions: [
                functionCall(
                    'cancel_all_tonic_limit_orders',
                    {
                        market_id: params.market,
                    },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        };
    }

    /*
     * Requirement: No open orders
     * 1. redeem base & quote ft from dex
     * 2. redeem base ft from bot
     * 3. redeem quote ft from bot
     * 4. close bot
     */
    static async close(params: CloseNearBotParms) {
        const openOrders = await this.getOpenOrders({
            protocol: params.protocol,
            market: params.market,
            botIndex: params.botIndex,
            contractId: params.contractId,
            networkId: params.networkId,
        });
        if (openOrders.length > 0) {
            throw `Close tonic bot error: open orders existed`;
        }

        const payloads: NearTransactionPayload[] = [];

        const marketConfig = getTonicMarketConfig(params.market) as TonicMarketConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(marketConfig.baseSymbol) as NearTokenConfig;
        const quoteTokenConfig = getNearTokenConfigBySymbol(marketConfig.quoteSymbol) as NearTokenConfig;
        const botContractId = `${params.botIndex}.${params.contractId}`;

        const tonicBalances = await nearViewFunction('get_balances', { account_id: botContractId }, TONIC_CONTRACT_ID);
        const tonicBaseBalance = tonicBalances.find((i) => i[0].replace('ft:', '') == baseTokenConfig.accountId);
        const tonicQuoteBalance = tonicBalances.find((i) => i[0].replace('ft:', '') == quoteTokenConfig.accountId);
        const baseBalance = tonicBaseBalance
            ? nativeToUi(new Decimal(tonicBaseBalance[1]), baseTokenConfig.decimals)
            : ZERO_DECIMAL;
        const quoteBalance = tonicQuoteBalance
            ? nativeToUi(new Decimal(tonicQuoteBalance[1]), quoteTokenConfig.decimals)
            : ZERO_DECIMAL;

        // 1. redeem base & quote ft from dex
        const redeemFromDexPayload: NearTransactionPayload = { receiverId: botContractId, actions: [] };
        if (baseBalance.gt(ZERO_DECIMAL)) {
            console.log(`Redeem ${baseBalance} ${baseTokenConfig.symbol} from dex`);
            redeemFromDexPayload.actions.push(redeemFromTonicAction(baseTokenConfig.symbol, baseBalance));
        }
        if (quoteBalance.gt(ZERO_DECIMAL)) {
            console.log(`Redeem ${quoteBalance} ${quoteTokenConfig.symbol} from dex`);
            redeemFromDexPayload.actions.push(redeemFromTonicAction(quoteTokenConfig.symbol, quoteBalance));
        }
        if (redeemFromDexPayload.actions.length > 0) {
            payloads.push(redeemFromDexPayload);
        }

        // 2. redeem base ft from bot
        if (baseTokenConfig.symbol != 'NEAR') {
            const botBaseBalance = await getNearTokenBalance(baseTokenConfig.symbol, botContractId).then((res) =>
                res.add(baseBalance),
            );
            if (botBaseBalance.gt(ZERO_DECIMAL)) {
                console.log(`Redeem ${botBaseBalance} ${baseTokenConfig.symbol} from bot`);
                payloads.push({
                    receiverId: params.contractId,
                    actions: [
                        functionCall(
                            'withdraw',
                            {
                                bot_index: params.botIndex,
                                token_id: baseTokenConfig.accountId,
                                withdraw_amount: uiToNative(botBaseBalance, baseTokenConfig.decimals).toFixed(),
                            },
                            DEFAULT_GAS,
                            ZERO_BN,
                        ),
                    ],
                });
            }
        }

        // 3. redeem quote ft from bot
        if (quoteTokenConfig.symbol != 'NEAR') {
            const botQuoteBalance = await getNearTokenBalance(quoteTokenConfig.symbol, botContractId).then((res) =>
                res.add(quoteBalance),
            );
            if (botQuoteBalance.gt(ZERO_DECIMAL)) {
                console.log(`Redeem ${botQuoteBalance} ${quoteTokenConfig.symbol} from bot`);
                payloads.push({
                    receiverId: params.contractId,
                    actions: [
                        functionCall(
                            'withdraw',
                            {
                                bot_index: params.botIndex,
                                token_id: quoteTokenConfig.accountId,
                                withdraw_amount: uiToNative(botQuoteBalance, quoteTokenConfig.decimals).toFixed(),
                            },
                            DEFAULT_GAS,
                            ZERO_BN,
                        ),
                    ],
                });
            }
        }

        // 4. close bot
        console.log(`Close bot ${botContractId}`);
        payloads.push({
            receiverId: params.contractId,
            actions: [
                functionCall(
                    'close_bot',
                    {
                        bot_index: params.botIndex,
                    },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        });
        return payloads;
    }
}
