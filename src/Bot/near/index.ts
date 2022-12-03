import {
    CancelAllNearOrdersParams,
    CancelNearOrderParams,
    CloseNearBotParms,
    CloseNearMarketParams,
    CreateNearBotParams,
    GetNearBotInfoParams,
    GetNearOpenOrdersParams,
    NearBotAccount,
    NearBotInfo,
    NearNetworkId,
    NearSetCellConfigParams,
    NearSetDelegateParams,
    NearTransactionPayload,
    OpenOrder,
    PlaceNearOrderParams,
    Protocol,
} from '../../type';
import {
    botProtocolEnumToStr,
    botProtocolStrToEnum,
    botStatusStrToEnum,
    botTypeStrToEnum,
    nativeToUi,
    nearViewFunction,
    uiToNative,
} from '../../util';
import Decimal from 'decimal.js';
import { TonicBot } from './TonicBot';
import { functionCall } from 'near-api-js/lib/transaction';
import { DEFAULT_GAS, ZERO_BN } from '../../constant';
import { RefBot } from './RefBot';

export class NearBot {
    static async load(
        botIndex: number,
        contractId: string,
        networkId = NearNetworkId.mainnet,
    ): Promise<NearBotAccount> {
        const botContractId = `${botIndex}.${contractId}`;
        const bot = await nearViewFunction('get_bot_info', {}, botContractId, networkId);

        const balances = {};
        for (const i of Object.entries(bot['balances'])) {
            balances[i[0]] = new Decimal(i[1] as Decimal.Value);
        }

        return {
            contractId: botContractId,
            owner: bot['bot_owner'],
            amount: nativeToUi(new Decimal(bot['deposit_asset_quantity']), 6),
            market: bot['market_id'],
            protocol: botProtocolStrToEnum(bot['protocol']),
            type: botTypeStrToEnum(bot['bot_type']),
            status: botStatusStrToEnum(bot['bot_status']),
            startPrice: nativeToUi(new Decimal(bot['start_price']), 6),
            lowerPrice: nativeToUi(new Decimal(bot['lower_price']), 6),
            upperPrice: nativeToUi(new Decimal(bot['upper_price']), 6),
            gridNumber: new Decimal(bot['grid_num']),
            leverage: nativeToUi(new Decimal(bot['leverage']), 2),
            referer: bot['referer'],
            perpFeeDiscount: new Decimal(bot['perf_fee_discount']),
            balances,
        };
    }

    static async loadAll(contractId: string, networkId = NearNetworkId.mainnet): Promise<NearBotInfo[]> {
        return nearViewFunction('get_all_bots', {}, contractId, networkId).then((bots) =>
            bots.map((bot) => {
                return {
                    contractId: bot['bot_account'],
                    owner: bot['bot_owner'],
                    isClosed: bot['is_closed'],
                };
            }),
        );
    }

    static create(params: CreateNearBotParams): Promise<[number, NearTransactionPayload[]]> {
        switch (params.protocol) {
            case Protocol.Tonic:
                return TonicBot.create(params);
            // case Protocol.Ref:
            //     return RefBot.create(params);
            default:
                throw `Create near bot error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static start(botIndex: number, contractId: string): NearTransactionPayload {
        return {
            receiverId: `${botIndex}.${contractId}`,
            actions: [functionCall('start_bot', {}, DEFAULT_GAS, ZERO_BN)],
        };
    }

    static getBotInfo(params: GetNearBotInfoParams) {
        switch (params.protocol) {
            case Protocol.Tonic:
                return TonicBot.getBotInfo(params);
            case Protocol.Ref:
                return RefBot.getBotInfo(params);
            default:
                throw `Get near bot info error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static getOpenOrders(params: GetNearOpenOrdersParams): Promise<OpenOrder[]> {
        switch (params.protocol) {
            case Protocol.Tonic:
                return TonicBot.getOpenOrders(params);
            case Protocol.Ref:
                return RefBot.getOpenOrders(params);
            default:
                throw `Cancel near bot open orders error: unsupported protocol ${botProtocolEnumToStr(
                    params.protocol,
                )}`;
        }
    }

    static stop(botIndex: number, contractId: string): NearTransactionPayload {
        return {
            receiverId: `${botIndex}.${contractId}`,
            actions: [functionCall('stop_bot', {}, DEFAULT_GAS, ZERO_BN)],
        };
    }

    static placeOrder(params: PlaceNearOrderParams) {
        switch (params.protocol) {
            case Protocol.Tonic:
                return TonicBot.placeOrder(params);
            case Protocol.Ref:
                return RefBot.placeOrder(params);
            default:
                throw `Place near bot order info error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static cancelOrder(params: CancelNearOrderParams) {
        switch (params.protocol) {
            case Protocol.Tonic:
                return TonicBot.cancelOrder(params);
            case Protocol.Ref:
                return RefBot.cancelOrder(params);
            default:
                throw `Cancel near bot order error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static cancelAllOrders(params: CancelAllNearOrdersParams) {
        switch (params.protocol) {
            case Protocol.Tonic:
                return TonicBot.cancelAllOrders(params);
            default:
                throw `Cancel near bot all orders error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static closeMarket(params: CloseNearMarketParams) {
        switch (params.protocol) {
            case Protocol.Tonic:
                return TonicBot.closeMarket(params);
            default:
                throw `Close near bot market error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static close(params: CloseNearBotParms) {
        switch (params.protocol) {
            case Protocol.Tonic:
                return TonicBot.close(params);
            default:
                throw `Cancel near bot error: unsupported protocol ${botProtocolEnumToStr(params.protocol)}`;
        }
    }

    static setDelegate(params: NearSetDelegateParams): NearTransactionPayload {
        return {
            receiverId: `${params.botIndex}.${params.contractId}`,
            actions: [functionCall('set_delegate', { delegate: params.delegateAccountId }, DEFAULT_GAS, ZERO_BN)],
        };
    }

    /*
     * Add referer & discount in cell config, discount 0.1 as 10%
     */
    static addReferer(refererAccount: string, discount: Decimal, contractId: string): NearTransactionPayload {
        return {
            receiverId: contractId,
            actions: [
                functionCall(
                    'add_referer',
                    { referer_account: refererAccount, discount: uiToNative(discount, 2).toNumber() },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        };
    }

    /*
     * Set referer to bot
     */
    static setReferer(refererAccount: string, botIndex: number, contractId: string): NearTransactionPayload {
        return {
            receiverId: contractId,
            actions: [
                functionCall('set_bot_referer', { bot_index: botIndex, referer: refererAccount }, DEFAULT_GAS, ZERO_BN),
            ],
        };
    }

    static getRefererDiscount(refererAccount: string, contractId: string): Promise<Decimal> {
        return nearViewFunction('get_referer_discount', { referer_account: refererAccount }, contractId).then((res) =>
            nativeToUi(new Decimal(res), 2),
        );
    }
}

export class NearCellConfig {
    static load(contractId: string) {
        return nearViewFunction('get_cell_info', {}, contractId);
    }

    static set(params: NearSetCellConfigParams) {
        return {
            receiverId: params.contractId,
            actions: [
                functionCall(
                    'set_cell_config',
                    {
                        delegate: params.delegateAccountId,
                        create_bot_line: params.createBotLine.toFixed(),
                        stop_bot_line: params.stopBotLine.toFixed(),
                        perf_fee_ratio: params.perpFeeRatio.toNumber(),
                        bot_owner_most_perf_fee_ratio: params.botOwnerMostPerpFeeRatio.toNumber(),
                    },
                    DEFAULT_GAS,
                    ZERO_BN,
                ),
            ],
        };
    }
}
