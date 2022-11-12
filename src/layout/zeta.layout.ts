import BN from 'bn.js';
import { seq, Structure, u32, u8 } from 'buffer-layout';
import { bool, i64, publicKeyLayout, u64 } from '@blockworks-foundation/mango-client';
import { PublicKey } from '@solana/web3.js';

class ZetaAnchorDecimal {
    flags: BN;
    hi: BN;
    lo: BN;
    mid: BN;

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaAnchorDecimalLayout extends Structure {
    constructor(property) {
        super([u32('flags'), u32('hi'), u32('lo'), u32('mid')], property);
    }

    decode(b, offset) {
        return new ZetaAnchorDecimal(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaAnchorDecimalLayout(property = '') {
    return new ZetaAnchorDecimalLayout(property);
}

class ZetaStrike {
    isSet: boolean;
    value: BN;

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaStrikeLayout extends Structure {
    constructor(property) {
        super([bool('isSet'), u64('value')], property);
    }

    decode(b, offset) {
        return new ZetaStrike(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaStrikeLayout(property = '') {
    return new ZetaStrikeLayout(property);
}

class ZetaProduct {
    market: PublicKey;
    strike: ZetaStrike;
    dirty: boolean;
    // uninitialized, call, put, future, perp
    kind: BN;

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaProductLayout extends Structure {
    constructor(property) {
        super([publicKeyLayout('market'), zetaStrikeLayout('strike'), bool('dirty'), u8('kind')], property);
    }

    decode(b, offset) {
        return new ZetaProduct(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaProductLayout(property = '') {
    return new ZetaProductLayout(property);
}

class ZetaHaltState {
    halted: boolean;
    spotPrice: BN;
    timestamp: BN;
    markPricesSet: boolean[];
    markPricesSetPadding: boolean[];
    marketNodesCleaned: boolean[];
    marketNodesCleanedPadding: boolean[];
    marketCleaned: boolean[];
    marketCleanedPadding: boolean[];

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaHaltStateLayout extends Structure {
    constructor(property) {
        super(
            [
                bool('halted'),
                u64('spotPrice'),
                u64('timestamp'),
                seq(bool(), 2, 'markPricesSet'),
                seq(bool(), 4, 'markPricesSetPadding'),
                seq(bool(), 2, 'marketNodesCleaned'),
                seq(bool(), 4, 'marketNodesCleanedPadding'),
                seq(bool(), 46, 'marketCleaned'),
                seq(bool(), 92, 'marketCleanedPadding'),
            ],
            property,
        );
    }

    decode(b, offset) {
        return new ZetaHaltState(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaHaltStateLayout(property = '') {
    return new ZetaHaltStateLayout(property);
}

class ZetaPricingParameters {
    optionTradeNormalizer: BN;
    futureTradeNormalizer: BN;
    maxVolatilityRetreat: BN;
    maxInterestRetreat: BN;
    maxDelta: BN;
    minDelta: BN;
    minVolatility: BN;
    maxVolatility: BN;
    minInterestRate: BN;
    maxInterestRate: BN;

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaPricingParametersLayout extends Structure {
    constructor(property) {
        super(
            [
                zetaAnchorDecimalLayout('optionTradeNormalizer'),
                zetaAnchorDecimalLayout('futureTradeNormalizer'),
                zetaAnchorDecimalLayout('maxVolatilityRetreat'),
                zetaAnchorDecimalLayout('maxInterestRetreat'),
                u64('maxDelta'),
                u64('minDelta'),
                u64('minVolatility'),
                u64('maxVolatility'),
                i64('minInterestRate'),
                i64('maxInterestRate'),
            ],
            property,
        );
    }

    decode(b, offset) {
        return new ZetaPricingParameters(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaPricingParametersLayout(property = '') {
    return new ZetaPricingParametersLayout(property);
}

class ZetaMarginParameters {
    futureMarginInitial: BN;
    futureMarginMaintenance: BN;
    optionMarkPercentageLongInitial: BN;
    optionSpotPercentageLongInitial: BN;
    optionSpotPercentageShortInitial: BN;
    optionDynamicPercentageShortInitial: BN;
    optionMarkPercentageLongMaintenance: BN;
    optionSpotPercentageLongMaintenance: BN;
    optionSpotPercentageShortMaintenance: BN;
    optionDynamicPercentageShortMaintenance: BN;
    optionShortPutCapPercentage: BN;
    padding: BN[];

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaMarginParametersLayout extends Structure {
    constructor(property) {
        super(
            [
                u64('futureMarginInitial'),
                u64('futureMarginMaintenance'),
                u64('optionMarkPercentageLongInitial'),
                u64('optionSpotPercentageLongInitial'),
                u64('optionSpotPercentageShortInitial'),
                u64('optionDynamicPercentageShortInitial'),
                u64('optionMarkPercentageLongMaintenance'),
                u64('optionSpotPercentageLongMaintenance'),
                u64('optionSpotPercentageShortMaintenance'),
                u64('optionDynamicPercentageShortMaintenance'),
                u64('optionShortPutCapPercentage'),
                seq(u8(), 32, 'padding'),
            ],
            property,
        );
    }

    decode(b, offset) {
        return new ZetaMarginParameters(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaMarginParametersLayout(property = '') {
    return new ZetaMarginParametersLayout(property);
}

class ZetaExpirySeries {
    activeTs: BN;
    expiryTs: BN;
    dirty: boolean;
    padding: BN[];

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaExpirySeriesLayout extends Structure {
    constructor(property) {
        super([u64('activeTs'), u64('expiryTs'), bool('dirty'), seq(u8(), 15, 'padding')], property);
    }

    decode(b, offset) {
        return new ZetaExpirySeries(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaExpirySeriesLayout(property = '') {
    return new ZetaExpirySeriesLayout(property);
}

class ZetaPerpParameters {
    minFundingRatePercent: BN;
    maxFundingRatePercent: BN;
    impactCashDelta: BN;

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaPerpParametersLayout extends Structure {
    constructor(property) {
        super([i64('minFundingRatePercent'), i64('maxFundingRatePercent'), u64('impactCashDelta')], property);
    }

    decode(b, offset) {
        return new ZetaPerpParameters(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaPerpParametersLayout(property = '') {
    return new ZetaPerpParametersLayout(property);
}

class ZetaPosition {
    size: BN;
    costOfTrades: BN;

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaPositionLayout extends Structure {
    constructor(property) {
        super([i64('size'), u64('costOfTrades')], property);
    }

    decode(b, offset) {
        return new ZetaPosition(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaPositionLayout(property = '') {
    return new ZetaPositionLayout(property);
}

class ZetaOrderState {
    closingOrders: BN;
    openingOrders: BN[];

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaOrderStateLayout extends Structure {
    constructor(property) {
        super([u64('closingOrders'), seq(u64(), 2, 'openingOrders')], property);
    }

    decode(b, offset) {
        return new ZetaOrderState(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaOrderStateLayout(property = '') {
    return new ZetaOrderStateLayout(property);
}

class ZetaProductLedger {
    position: ZetaPosition;
    orderState: ZetaOrderState;

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaProductLedgerLayout extends Structure {
    constructor(property) {
        super([zetaPositionLayout('position'), zetaOrderStateLayout('orderState')], property);
    }

    decode(b, offset) {
        return new ZetaProductLedger(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

function zetaProductLedgerLayout(property = '') {
    return new ZetaProductLedgerLayout(property);
}

export class ZetaGroupAccount {
    anchorIndex: BN;
    nonce: BN;
    vaultNonce: BN;
    insuranceVaultNonce: BN;
    frontExpiryIndex: BN;
    haltState: ZetaHaltState;
    underlyingMint: PublicKey;
    oracle: PublicKey;
    greeks: PublicKey;
    pricingParameters: ZetaPricingParameters;
    marginParameters: ZetaMarginParameters;
    products: ZetaProduct[];
    productsPadding: ZetaProduct[];
    perp: ZetaProduct;
    expirySeries: ZetaExpirySeries[];
    expirySeriesPadding: ZetaExpirySeries[];
    totalInsuranceVaultDeposits: BN;
    asset: BN;
    expiryIntervalSeconds: BN;
    newExpiryThresholdSeconds: BN;
    perpParameters: ZetaPerpParameters;
    perpSyncQueue: PublicKey;
    padding: BN[];

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaGroupAccountLayout extends Structure {
    constructor(property) {
        super(
            [
                u64('anchorIndex'),
                u8('nonce'),
                u8('vaultNonce'),
                u8('insuranceVaultNonce'),
                u8('frontExpiryIndex'),
                zetaHaltStateLayout('haltState'),
                publicKeyLayout('underlyingMint'),
                publicKeyLayout('oracle'),
                publicKeyLayout('greeks'),
                zetaPricingParametersLayout('pricingParameters'),
                zetaMarginParametersLayout('marginParameters'),
                seq(zetaProductLayout(), 46, 'products'),
                seq(zetaProductLayout(), 91, 'productsPadding'),
                zetaProductLayout('perp'),
                seq(zetaExpirySeriesLayout(), 2, 'expirySeries'),
                seq(zetaExpirySeriesLayout(), 4, 'expirySeriesPadding'),
                u64('totalInsuranceVaultDeposits'),
                // SOL, BTC, ETH, undefined
                u8('asset'),
                u32('expiryIntervalSeconds'),
                u32('newExpiryThresholdSeconds'),
                zetaPerpParametersLayout('perpParameters'),
                publicKeyLayout('perpSyncQueue'),
                seq(u8(), 998, 'padding'),
            ],
            property,
        );
    }

    decode(b, offset) {
        return new ZetaGroupAccount(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

export function zetaGroupAccountLayout(property = '') {
    return new ZetaGroupAccountLayout(property);
}

export class ZetaMarginAccount {
    anchorIndex: BN;
    authority: PublicKey;
    nonce: BN;
    balance: BN;
    forceCancelFlag: boolean;
    openOrdersNonce: BN[];
    seriesExpiry: BN[];
    seriesExpiryPadding: BN[];
    productLedgers: ZetaProductLedger[];
    productLedgersPadding: ZetaProductLedger[];
    perpProductLedger: ZetaProductLedger;
    rebalanceAmount: BN;
    asset: BN;
    accountType: BN;
    lastFundingDelta: ZetaAnchorDecimal;
    padding: BN[];

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class ZetaMarginAccountLayout extends Structure {
    constructor(property) {
        super(
            [
                u64('anchorIndex'),
                publicKeyLayout('authority'),
                u8('nonce'),
                u64('balance'),
                bool('forceCancelFlag'),
                seq(u8(), 138, 'openOrdersNonce'),
                seq(u64(), 5, 'seriesExpiry'),
                u64('seriesExpiryPadding'),
                seq(zetaProductLedgerLayout(), 46, 'productLedgers'),
                seq(zetaProductLedgerLayout(), 91, 'productLedgersPadding'),
                zetaProductLedgerLayout('perpProductLedger'),
                i64('rebalanceAmount'),
                // SOL, BTC, ETH, undefined
                u8('asset'),
                // normal, marketMaker
                u8('accountType'),
                zetaAnchorDecimalLayout('lastFundingDelta'),
                seq(u8(), 370, 'padding'),
            ],
            property,
        );
    }

    decode(b, offset) {
        return new ZetaMarginAccount(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

export function zetaMarginAccountLayout(property = '') {
    return new ZetaMarginAccountLayout(property);
}
