import { CreateNearBotParams, NearTokenConfig, NearTransactionPayload, SpinSpotMarketConfig } from '../../type';
import { NearBot } from './index';
import {
    botProtocolEnumToStr,
    botTypeEnumToStr,
    decimalToBN,
    getMarketPrice,
    getNearTokenConfigBySymbol,
    getSpinSpotMarketConfig,
    uiToNative,
} from '../../util';
import { functionCall } from 'near-api-js/lib/transaction';
import { BOT_CONTRACT_STORAGE_NEAR, DEFAULT_GAS, ONE_NEAR_YOCTO, ZERO_DECIMAL } from '../../constant';
import BN from 'bn.js';

export class SpinSpotBot {
    /*
     * 1. Create bot (need deposit NEAR to deploy bot contract, see BOT_CONTRACT_STORAGE_NEAR)
     * 2. Register bot in quote ft & deposit quote ft to bot
     * 3. Register bot in base ft & deposit base ft to bot (if NEAR deposit directly)
     * 4. Deposit quote & base to Spin
     * returns [botIndex, transactionPayloads]
     */
    static async create(params: CreateNearBotParams): Promise<[number, NearTransactionPayload[]]> {
        const payloads: NearTransactionPayload[] = [];
        const botIndex = await NearBot.loadAll(params.contractId).then((res) => res.length);
        const botContractId = `${botIndex}.${params.contractId}`;

        const marketConfig = getSpinSpotMarketConfig(params.market) as SpinSpotMarketConfig;
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
                    functionCall('deposit_near', {}, DEFAULT_GAS, decimalToBN(uiToNative(params.baseTokenBalance, 24))),
                ],
            });
        }
        // TODO 4. Deposit quote & base to Spin

        return [botIndex, payloads];
    }
}
