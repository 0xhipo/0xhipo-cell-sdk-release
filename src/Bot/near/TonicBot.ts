import {
    BotInfo,
    CancelAllNearOrdersParams,
    CancelNearOrderParams,
    CloseNearBotParms,
    CloseNearMarketParams,
    CreateNearBotParams,
    GetNearBotInfoParams,
    GetNearOpenOrdersParams,
    NearTokenConfig,
    NearTransactionPayload,
    OpenOrder,
    OrderSide,
    OrderType,
    PlaceNearOrderParams,
    TonicMarketConfig,
} from '../../type';
import { NearBot } from './index';
import { functionCall } from 'near-api-js/lib/transaction';
import {
    botProtocolEnumToStr,
    botTypeEnumToStr,
    decimalToBN,
    getMarketPrice,
    getNearTokenBalance,
    getNearTokenConfigBySymbol,
    getTonicMarketConfig,
    nativeToUi,
    nearViewFunction,
    redeemFromTonicAction,
    tonicOrderSideTransform,
    tonicOrderTypeTransform,
    uiToNative,
} from '../../util';
import {
    BOT_CONTRACT_STORAGE_NEAR,
    DEFAULT_GAS,
    ONE_NEAR_YOCTO,
    TONIC_CONTRACT_ID,
    ZERO_BN,
    ZERO_DECIMAL,
} from '../../constant';
import BN from 'bn.js';
import Decimal from 'decimal.js';

export class TonicBot {
    /*
     * 1. Create bot (need deposit NEAR to deploy bot contract, see BOT_CONTRACT_STORAGE_NEAR)
     * 2. Register bot in quote ft & deposit quote ft to bot
     * 3. Register bot in base ft & deposit base ft to bot (if NEAR deposit directly)
     * 4. Register bot in tonic
     * 5. Deposit quote & base to tonic
     * returns [botIndex, transactionPayloads]
     */
    static async create(params: CreateNearBotParams): Promise<[number, NearTransactionPayload[]]> {
        const payloads: NearTransactionPayload[] = [];
        const botIndex = await NearBot.loadAll(params.contractId).then((res) => res.length);
        const botContractId = `${botIndex}.${params.contractId}`;

        const marketConfig = getTonicMarketConfig(params.market) as TonicMarketConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(marketConfig.baseSymbol) as NearTokenConfig;
        const quoteTokenConfig = getNearTokenConfigBySymbol(marketConfig.quoteSymbol) as NearTokenConfig;
        const [basePrice, quotePrice] = await Promise.all([
            getMarketPrice(baseTokenConfig.symbol),
            getMarketPrice(quoteTokenConfig.symbol),
        ]);
        const botValue = basePrice.mul(params.baseTokenBalance).add(quotePrice.mul(params.quoteTokenBalance));

        // 1. create bot
        console.log(`Create bot ${botContractId}`);
        payloads.push({
            receiverId: params.contractId,
            actions: [
                functionCall(
                    'create_bot',
                    {
                        deposit_asset_quantity: uiToNative(botValue, quoteTokenConfig.decimals).toFixed(),
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

        // 2. Register bot in quote ft & deposit quote ft to bot
        console.log(`Register ${botContractId} in ${quoteTokenConfig.symbol}`);
        const depositQuoteToBotPayload: NearTransactionPayload = {
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
            ],
        };
        if (params.quoteTokenBalance.gt(ZERO_DECIMAL)) {
            console.log(`Deposit ${params.quoteTokenBalance} ${quoteTokenConfig.symbol} to bot`);
            depositQuoteToBotPayload.actions.push(
                functionCall(
                    'ft_transfer_call',
                    {
                        receiver_id: botContractId,
                        amount: uiToNative(params.quoteTokenBalance, quoteTokenConfig.decimals).toFixed(),
                        msg: botIndex.toString(),
                    },
                    DEFAULT_GAS.divn(2),
                    new BN(1),
                ),
            );
        }
        payloads.push(depositQuoteToBotPayload);

        // 3. Register bot in base ft & deposit base ft to bot
        if (baseTokenConfig.symbol != 'NEAR') {
            console.log(`Register ${botContractId} in ${baseTokenConfig.symbol}`);
            const depositBaseToBotPayload: NearTransactionPayload = {
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
            };
            if (params.baseTokenBalance.gt(ZERO_DECIMAL)) {
                console.log(`Deposit ${params.baseTokenBalance} ${baseTokenConfig.symbol} to bot`);
                depositBaseToBotPayload.actions.push(
                    functionCall(
                        'ft_transfer_call',
                        {
                            receiver_id: botContractId,
                            amount: uiToNative(params.baseTokenBalance, baseTokenConfig.decimals).toFixed(),
                            msg: botIndex.toString(),
                        },
                        DEFAULT_GAS.divn(2),
                        new BN(1),
                    ),
                );
            }
            payloads.push(depositBaseToBotPayload);
        } else {
            console.log(`Deposit ${params.baseTokenBalance} NEAR to bot`);
            payloads.push({
                receiverId: botContractId,
                actions: [
                    functionCall(
                        'deposit_near',
                        {},
                        DEFAULT_GAS,
                        ONE_NEAR_YOCTO.mul(decimalToBN(params.baseTokenBalance)),
                    ),
                ],
            });
        }

        // 4. Register bot in tonic
        console.log(`Register ${botContractId} in tonic`);
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

        // 5. Deposit quote & base to tonic
        const depositToTonicPayload: NearTransactionPayload = {
            receiverId: botContractId,
            actions: [],
        };
        if (params.quoteTokenBalance.gt(ZERO_DECIMAL)) {
            console.log(`Deposit ${params.quoteTokenBalance} ${quoteTokenConfig.symbol} to tonic`);
            depositToTonicPayload.actions.push(
                functionCall(
                    'deposit_ft_to_tonic',
                    {
                        token_id: quoteTokenConfig.accountId,
                        deposit_amount: uiToNative(params.quoteTokenBalance, 6).toFixed(),
                    },
                    DEFAULT_GAS.divn(2),
                    ZERO_BN,
                ),
            );
        }
        if (params.baseTokenBalance.gt(ZERO_DECIMAL)) {
            if (baseTokenConfig.symbol != 'NEAR') {
                console.log(`Deposit ${params.baseTokenBalance} ${baseTokenConfig.symbol} to tonic`);
                depositToTonicPayload.actions.push(
                    functionCall(
                        'deposit_ft_to_tonic',
                        {
                            token_id: baseTokenConfig.accountId,
                            deposit_amount: uiToNative(params.baseTokenBalance, baseTokenConfig.decimals).toFixed(),
                        },
                        DEFAULT_GAS.divn(2),
                        ZERO_BN,
                    ),
                );
            } else {
                console.log(`Deposit ${params.baseTokenBalance} NEAR to tonic`);
                depositToTonicPayload.actions.push(
                    functionCall(
                        'deposit_near_to_tonic',
                        {
                            deposit_amount: uiToNative(params.baseTokenBalance, baseTokenConfig.decimals).toFixed(),
                        },
                        DEFAULT_GAS.divn(2),
                        ZERO_BN,
                    ),
                );
            }
        }
        payloads.push(depositToTonicPayload);
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
        let baseBalance = tonicBaseBalance
            ? nativeToUi(new Decimal(tonicBaseBalance[1]), baseTokenConfig.decimals)
            : ZERO_DECIMAL;
        let quoteBalance = tonicQuoteBalance
            ? nativeToUi(new Decimal(tonicQuoteBalance[1]), quoteTokenConfig.decimals)
            : ZERO_DECIMAL;

        // add in orders base / quote balance
        const openOrders = await this.getOpenOrders({
            protocol: params.protocol,
            market: params.market,
            botIndex: params.botIndex,
            contractId: params.contractId,
            networkId: params.networkId,
        });
        for (const openOrder of openOrders) {
            if (openOrder.side == OrderSide.Bid) {
                quoteBalance = quoteBalance.add(openOrder.price.mul(openOrder.size));
            } else {
                baseBalance = baseBalance.add(openOrder.size);
            }
        }

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

    static async closeMarket(params: CloseNearMarketParams): Promise<NearTransactionPayload | undefined> {
        const botInfo = await this.getBotInfo({
            protocol: params.protocol,
            market: params.market,
            botIndex: params.botIndex,
            contractId: params.contractId,
            networkId: params.networkId,
        });

        if (botInfo.position.eq(ZERO_DECIMAL)) {
            return;
        }
        const side = botInfo.position.gt(ZERO_DECIMAL) ? OrderSide.Ask : OrderSide.Bid;

        return this.placeOrder({
            protocol: params.protocol,
            market: params.market,
            price: new Decimal(1),
            size: botInfo.position.abs(),
            side,
            orderType: OrderType.Market,
            clientId: Math.floor(new Date().getTime() / 1000).toString(),
            botIndex: params.botIndex,
            contractId: params.contractId,
        });
    }

    /*
     * Requirement: No open orders
     * 1. Redeem base & quote ft from tonic
     * 2. Register wallet in base ft (if needed)
     * 3. Redeem base ft from bot (if needed and base not NEAR)
     * 4. Redeem quote ft from bot (if needed and quote not NEAR)
     * 5. Close bot
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

        // 1. Redeem base & quote ft from tonic
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

        // 2. Register wallet in base ft (if needed)
        // 3. Redeem base ft from bot (if needed and base not NEAR)
        if (baseTokenConfig.symbol != 'NEAR') {
            const botBaseBalance = await getNearTokenBalance(baseTokenConfig.symbol, botContractId).then((res) =>
                res.add(baseBalance),
            );
            if (botBaseBalance.gt(ZERO_DECIMAL)) {
                const storageBalance = await nearViewFunction(
                    'storage_balance_of',
                    {
                        account_id: params.userAccountId,
                    },
                    baseTokenConfig.accountId,
                );
                if (!storageBalance) {
                    console.log(`Register ${params.userAccountId} in ${baseTokenConfig.symbol}`);
                    payloads.push({
                        receiverId: baseTokenConfig.accountId,
                        actions: [
                            functionCall(
                                'storage_deposit',
                                {
                                    account_id: params.userAccountId,
                                    registration_only: true,
                                },
                                DEFAULT_GAS,
                                // 0.0125 NEAR
                                new BN('12500000000000000000000'),
                            ),
                        ],
                    });
                }

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

        // 4. Redeem quote ft from bot (if needed and quote not NEAR)
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

        // 5. Close bot
        console.log(`Close bot ${botContractId} & redeem ${BOT_CONTRACT_STORAGE_NEAR} NEAR from bot contract`);
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
