import { PublicKey } from '@solana/web3.js';
import { solanaConnection } from '../example/constant.example';
import { MARKET_STATE_LAYOUT_V3 } from '@project-serum/serum';
import { SERUM_PROGRAM_ID } from '../src';

async function getSerumMarketConfig() {
    const marketKey = new PublicKey('8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh6');
    const accountInfo = await solanaConnection.getAccountInfo(marketKey);
    if (!accountInfo) {
        throw `Serum market account not found`;
    }

    const market = MARKET_STATE_LAYOUT_V3.decode(accountInfo.data);
    const vaultSigner = await PublicKey.createProgramAddress(
        [marketKey.toBuffer(), market['vaultSignerNonce'].toArrayLike(Buffer, 'le', 8)],
        SERUM_PROGRAM_ID,
    );
    console.log(market);
    console.log(`=`.repeat(100));
    console.log(`base lot size: ${market['baseLotSize'].toString()}`);
    console.log(`quote lot size: ${market['quoteLotSize'].toString()}`);
    console.log(`bids: ${market['bids'].toString()}`);
    console.log(`asks: ${market['asks'].toString()}`);
    console.log(`base mint: ${market['baseMint'].toString()}`);
    console.log(`quote mint: ${market['quoteMint'].toString()}`);
    console.log(`base vault: ${market['baseVault'].toString()}`);
    console.log(`quote vault: ${market['quoteVault'].toString()}`);
    console.log(`event queue: ${market['eventQueue'].toString()}`);
    console.log(`request queue: ${market['requestQueue'].toString()}`);
    console.log(`authority: ${market['authority'].toString()}`);
    console.log(`vault signer nonce: ${market['vaultSignerNonce'].toString()}`);
    console.log(`vault signer: ${vaultSigner.toString()}`);
}

getSerumMarketConfig();
