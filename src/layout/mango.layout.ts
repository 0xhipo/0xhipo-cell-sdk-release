import { greedy, seq, struct, u16, u32, u8 } from 'buffer-layout';
import { publicKeyLayout, u64 } from '@blockworks-foundation/mango-client';

export const MangoReimbursementTableRowLayout = struct([publicKeyLayout('owner'), seq(u64(), 16, 'balances')]);

export const MangoReimbursementTableLayout = struct([
    seq(MangoReimbursementTableRowLayout, greedy(MangoReimbursementTableRowLayout.span), 'rows'),
]);

export const MangoReimbursementGroupLayout = struct([
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
]);

export const MangoReimbursementAccountLayout = struct([u64('anchorIndex'), u16('reimbursed'), u16('claimTransferred')]);
