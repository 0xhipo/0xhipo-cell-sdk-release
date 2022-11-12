import { BotType, Protocol } from './type';

export class BotAccountNotFoundError extends Error {
    constructor(botSeed: string) {
        super(`Bot account not found, seed: ${botSeed}`);
        this.name = 'BotAccountNotFoundError';
    }
}

export class MangoSpotMarketNotFoundError extends Error {
    constructor(marketAddress: string) {
        super(`Mango spot market not found for address ${marketAddress}!`);
        this.name = 'MangoSpotMarketNotFoundError';
    }
}

export class MangoPerpMarketNotFoundError extends Error {
    constructor(marketAddress: string) {
        super(`Mango perp market not found for address ${marketAddress}!`);
        this.name = 'MangoPerpMarketNotFoundError';
    }
}

export class MangoSpotMarketNotFoundByNameError extends Error {
    constructor(marketName: string) {
        super(`Mango spot market not found for name ${marketName}!`);
        this.name = 'MangoSpotMarketNotFoundByNameError';
    }
}

export class MangoGroupConfigNotFoundError extends Error {
    constructor(mangoGroupName: string) {
        super(`Mango group config not found for name ${mangoGroupName}!`);
        this.name = 'MangoGroupConfigNotFoundError';
    }
}

export class BotMangoAccountNotFoundError extends Error {
    constructor(botSeed: string) {
        super(`No available mango account for bot ${botSeed}!`);
        this.name = 'BotMangoAccountNotFoundError';
    }
}

export class SerumMarketNotFoundError extends Error {
    constructor(marketAddress: string) {
        super(`Serum market not found for address ${marketAddress}!`);
        this.name = 'NoAvailableSwapMarketForTokenError';
    }
}

export class BotProtocolTypeNotSupportedError extends Error {
    constructor(botSeed: string, protocolType: Protocol) {
        super(`Bot ${botSeed} protocol type ${protocolType} not supported!`);
        this.name = 'BotProtocolTypeNotSupportedError';
    }
}

export class BotMarketNotSupportedError extends Error {
    constructor(botSeed: string, marketAddress: string) {
        super(`Bot ${botSeed} market ${marketAddress} not supported!`);
        this.name = 'BotMarketNotSupportedError';
    }
}

export class BotTypeNotSupportedError extends Error {
    constructor(botType: BotType) {
        super(`Bot type ${botType} not supported!`);
        this.name = 'BotTypeNotSupportedError';
    }
}

export class BotLeverageExceedMarketMaxLimitError extends Error {
    constructor(botSeed: string, marketAddress: string, marketLeverageLimit: number) {
        super(`Bot ${botSeed} leverage exceed market ${marketAddress} max leverage limit ${marketLeverageLimit}!`);
        this.name = 'BotLeverageExceedMarketMaxLimitError';
    }
}

export class BotZetaMarginAccountNotFoundError extends Error {
    constructor(botSeed: string) {
        super(`No available zeta margin account for bot ${botSeed}!`);
        this.name = 'BotZetaMarginAccountNotFoundError';
    }
}

export class ZetaGroupAccountNotFoundError extends Error {
    constructor(zetaGroupAccountAddress: string) {
        super(`Zeta group account not available: ${zetaGroupAccountAddress}!`);
        this.name = 'ZetaGroupAccountNotFoundError';
    }
}

export class CellConfigAccountNotFoundError extends Error {
    constructor(cellConfigKey: string) {
        super(`Cell config account not found for address ${cellConfigKey}!`);
        this.name = 'CellConfigAccountNotFoundError';
    }
}

export class PythPriceNotFoundError extends Error {
    constructor(priceKey: string) {
        super(`Pyth price not found for address ${priceKey}!`);
        this.name = 'PythPriceNotFoundError';
    }
}

export class CellCacheNotFoundError extends Error {
    constructor(botSeed: string, userAddress: string) {
        super(`Cell cache not found, seed: ${botSeed}, user ${userAddress}!`);
        this.name = 'CellCacheNotFoundError';
    }
}
