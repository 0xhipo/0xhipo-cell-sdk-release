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
    SpinPerpMarketConfig,
} from '../../type';
import { NearBot } from './index';
import {
    botProtocolEnumToStr,
    botTypeEnumToStr,
    getMarketPrice,
    getNearTokenConfigBySymbol,
    getSpinPerpMarketConfig,
    nativeToUi,
    nearViewFunction,
    uiToNative,
} from '../../util';
import { functionCall } from 'near-api-js/lib/transaction';
import {
    BOT_CONTRACT_STORAGE_NEAR,
    DEFAULT_GAS,
    ONE_NEAR_YOCTO,
    SPIN_PERP_CONTRACT_ID,
    ZERO_BN,
    ZERO_DECIMAL,
} from '../../constant';
import BN from 'bn.js';
import Decimal from 'decimal.js';

export class SpinPerpBot {
    /*
     * 1. Create bot (need deposit NEAR to deploy bot contract, see BOT_CONTRACT_STORAGE_NEAR)
     * 2. Register bot in quote ft & deposit quote ft to bot
     * 3. Deposit quote to Spin
     * returns [botIndex, transactionPayloads]
     */
    static async create(params: CreateNearBotParams): Promise<[number, NearTransactionPayload[]]> {
        const payloads: NearTransactionPayload[] = [];
        const botIndex = await NearBot.loadAll(params.contractId).then((res) => res.length);
        const botContractId = `${botIndex}.${params.contractId}`;

        const marketConfig = getSpinPerpMarketConfig(params.market) as SpinPerpMarketConfig;
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
                        deposit_asset_quantity: uiToNative(botValue, quoteTokenConfig.decimals).floor().toFixed(),
                        lower_price: uiToNative(params.lowerPrice, quoteTokenConfig.decimals).toFixed(),
                        upper_price: uiToNative(params.upperPrice, quoteTokenConfig.decimals).toFixed(),
                        grid_num: params.gridNumber.toNumber(),
                        leverage: uiToNative(params.leverage, 2).toNumber(),
                        market_id: params.market,
                        protocol: botProtocolEnumToStr(params.protocol),
                        bot_type: botTypeEnumToStr(params.botType),
                        start_price: uiToNative(params.startPrice, quoteTokenConfig.decimals).toFixed(),
                        referer: params.referer,
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

        // 3. Deposit quote to Spin
        console.log(`Deposit ${params.quoteTokenBalance} ${quoteTokenConfig.symbol} to Spin`);
        payloads.push({
            receiverId: botContractId,
            actions: [
                functionCall(
                    'deposit_to_spin_perp',
                    {
                        deposit_amount: uiToNative(params.quoteTokenBalance, quoteTokenConfig.decimals).toFixed(),
                    },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        });

        return [botIndex, payloads];
    }

    static async getBotInfo(params: GetNearBotInfoParams): Promise<BotInfo> {
        const botContractId = `${params.botIndex}.${params.contractId}`;

        const balance = await nearViewFunction('get_balance', { account_id: botContractId }, SPIN_PERP_CONTRACT_ID);
        const equity = nativeToUi(new Decimal(balance), 6);

        const positions = await nearViewFunction('get_positions', { account_id: botContractId }, SPIN_PERP_CONTRACT_ID);
        let position: Decimal;
        if (positions['positions'].length == 0) {
            position = ZERO_DECIMAL;
        } else {
            position =
                positions['positions'][0]['position_type'] == 'Long'
                    ? new Decimal(positions['positions'][0]['size_formatted'])
                    : new Decimal(positions['positions'][0]['size_formatted']).neg();
        }
        return {
            value: equity,
            position: position,
        };
    }

    static async getOpenOrders(params: GetNearOpenOrdersParams): Promise<OpenOrder[]> {
        const marketConfig = getSpinPerpMarketConfig(params.market) as SpinPerpMarketConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(marketConfig.baseSymbol) as NearTokenConfig;

        const botContractId = `${params.botIndex}.${params.contractId}`;
        return nearViewFunction(
            'get_orders',
            {
                market_id: Number(params.market),
                account_id: botContractId,
            },
            SPIN_PERP_CONTRACT_ID,
        ).then((openOrders) =>
            openOrders.map((openOrder) => {
                return {
                    price: nativeToUi(new Decimal(openOrder['price']), baseTokenConfig.decimals),
                    size: nativeToUi(new Decimal(openOrder['remaining']), baseTokenConfig.decimals),
                    side: openOrder['o_type'] == 'Bid' ? OrderSide.Bid : OrderSide.Ask,
                    orderId: openOrder['id'],
                    clientId: openOrder['client_order_id'].toString(),
                };
            }),
        );
    }

    static async placeOrder(params: PlaceNearOrderParams) {
        const orderValue = params.price.mul(params.size);
        if (orderValue.lte(new Decimal(0.1))) {
            throw `Place SpinPerp order error: order value must greater than 0.1 USDC`;
        }

        const marketConfig = getSpinPerpMarketConfig(params.market) as SpinPerpMarketConfig;
        const baseTokenConfig = getNearTokenConfigBySymbol(marketConfig.baseSymbol) as NearTokenConfig;
        const botContractId = `${params.botIndex}.${params.contractId}`;
        // deadline add 3 hrs from current timestamp
        const deadline = new Date().getTime() + 3600000;

        return {
            receiverId: botContractId,
            actions: [
                functionCall(
                    'place_spin_perp_order',
                    {
                        market_id: Number(params.market),
                        price: uiToNative(params.price, baseTokenConfig.decimals).toFixed(),
                        quantity: uiToNative(params.size, baseTokenConfig.decimals).toFixed(),
                        market_order: params.orderType == OrderType.Market,
                        client_order_id: Number(params.clientId),
                        time_in_force: 'GTC',
                        post_only: params.orderType == OrderType.PostOnly,
                        deadline: (deadline * Math.pow(10, 6)).toString(),
                        is_bid: params.side == OrderSide.Bid,
                    },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        };
    }

    static cancelOrder(params: CancelNearOrderParams): NearTransactionPayload {
        const botContractId = `${params.botIndex}.${params.contractId}`;
        // deadline add 3 hrs from current timestamp
        const deadline = new Date().getTime() + 3600000;
        return {
            receiverId: botContractId,
            actions: [
                functionCall(
                    'cancel_spin_perp_order',
                    {
                        market_id: Number(params.market),
                        order_id: params.orderId,
                        deadline: (deadline * Math.pow(10, 6)).toString(),
                    },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        };
    }

    static cancelAllOrders(params: CancelAllNearOrdersParams): NearTransactionPayload {
        const botContractId = `${params.botIndex}.${params.contractId}`;
        // deadline add 3 hrs from current timestamp
        const deadline = new Date().getTime() + 3600000;
        return {
            receiverId: botContractId,
            actions: [
                functionCall(
                    'cancel_all_spin_perp_orders',
                    {
                        market_id: Number(params.market),
                        limit: 100,
                        deadline: (deadline * Math.pow(10, 6)).toString(),
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

        const marketConfig = getSpinPerpMarketConfig(params.market) as SpinPerpMarketConfig;
        const marketPrice = await getMarketPrice(marketConfig.baseSymbol);
        const price = side == OrderSide.Bid ? marketPrice.mul(new Decimal(1.05)) : marketPrice.mul(new Decimal(0.95));
        const formattedPrice = price.toDecimalPlaces(marketConfig.orderPriceDecimals);

        console.log(
            `side: ${side}, price: ${price}, formattedPrice: ${formattedPrice}, size: ${botInfo.position.abs()}`,
        );

        return this.placeOrder({
            protocol: params.protocol,
            market: params.market,
            price: formattedPrice,
            size: botInfo.position.abs(),
            side,
            orderType: OrderType.Market,
            clientId: Math.floor(new Date().getTime() / 1000).toString(),
            botIndex: params.botIndex,
            contractId: params.contractId,
        });
    }

    /*
     * Requirement: No open orders & Zero position
     * 1. Redeem quote ft from Spin
     * 2. Redeem quote ft from bot
     * 3. Close bot
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
            throw `Close SpinPerp bot error: open orders existed`;
        }

        const botInfo = await this.getBotInfo({
            protocol: params.protocol,
            market: params.market,
            botIndex: params.botIndex,
            contractId: params.contractId,
            networkId: params.networkId,
        });
        if (botInfo.position.gt(ZERO_DECIMAL)) {
            throw `Close SpinPerp bot error: non-zero position`;
        }

        const usdcConfig = getNearTokenConfigBySymbol('USDC') as NearTokenConfig;
        const bot = await NearBot.load(params.botIndex, params.contractId, params.networkId);
        const botContractId = `${params.botIndex}.${params.contractId}`;
        const payloads: NearTransactionPayload[] = [];

        // 1. Redeem quote ft from Spin
        if (botInfo.value.gt(ZERO_DECIMAL)) {
            console.log(`Redeem ${botInfo.value} USDC from Spin Perp account`);
            payloads.push({
                receiverId: botContractId,
                actions: [
                    functionCall(
                        'withdraw_from_spin_perp',
                        { withdraw_amount: uiToNative(botInfo.value, usdcConfig.decimals) },
                        DEFAULT_GAS,
                        ZERO_BN,
                    ),
                ],
            });
        }

        // 2. Redeem quote ft from bot
        const botUSDCBalance = botInfo.value.add(nativeToUi(bot.balances[usdcConfig.accountId], usdcConfig.decimals));
        if (botUSDCBalance.gt(ZERO_DECIMAL)) {
            console.log(`Redeem ${botUSDCBalance} USDC from bot`);
            payloads.push({
                receiverId: params.contractId,
                actions: [
                    functionCall(
                        'withdraw',
                        {
                            bot_index: params.botIndex,
                            token_id: usdcConfig.accountId,
                            withdraw_amount: uiToNative(botUSDCBalance, usdcConfig.decimals).toFixed(),
                        },
                        DEFAULT_GAS,
                        ZERO_BN,
                    ),
                ],
            });
        }

        // 3. Close bot
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
