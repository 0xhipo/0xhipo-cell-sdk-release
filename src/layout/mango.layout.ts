import { greedy, seq, Structure, u16, u32, u8, struct } from 'buffer-layout';
import { publicKeyLayout, u64 } from '@blockworks-foundation/mango-client';
import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';

export class MangoReimbursementGroup {
    anchorIndex: BN;
    groupNum: BN;
    table: PublicKey;
    claimTransferDestination: PublicKey;
    authority: PublicKey;
    vaults: PublicKey[];
    claimMints: PublicKey[];
    mints: PublicKey[];
    reimbursementStarted: BN;
    bump: BN;
    testing: BN;

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class MangoReimbursementGroupLayout extends Structure {
    constructor(property) {
        super(
            [
                u64('anchorIndex'),
                u32('groupNum'),
                publicKeyLayout('table'),
                publicKeyLayout('claimTransferDestination'),
                publicKeyLayout('authority'),
                seq(publicKeyLayout(), 16, 'vaults'),
                seq(publicKeyLayout(), 16, 'claimMints'),
                seq(publicKeyLayout(), 16, 'mints'),
                u8('reimbursementStarted'),
                u8('bump'),
                u8('testing'),
            ],
            property,
        );
    }

    decode(b, offset) {
        return new MangoReimbursementGroup(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

export function mangoReimbursementGroupLayout(property = '') {
    return new MangoReimbursementGroupLayout(property);
}

export class MangoReimbursementAccount {
    anchorIndex: BN;
    reimbursed: BN;
    claimTransferred: BN;

    constructor(decoded: any) {
        Object.assign(this, decoded);
    }
}

class MangoReimbursementAccountLayout extends Structure {
    constructor(property) {
        super([u64('anchorIndex'), u16('reimbursed'), u16('claimTransferred')], property);
    }

    decode(b, offset) {
        return new MangoReimbursementAccount(super.decode(b, offset));
    }

    encode(src, b, offset) {
        return super.encode(src.toBuffer(), b, offset);
    }
}

export function mangoReimbursementAccountLayout(property = '') {
    return new MangoReimbursementAccountLayout(property);
}

export const MangoReimbursementTableRowLayout = struct([publicKeyLayout('owner'), seq(u64(), 16, 'balances')]);

export const MangoReimbursementTableLayout = struct([
    seq(MangoReimbursementTableRowLayout, greedy(MangoReimbursementTableRowLayout.span), 'rows'),
]);
