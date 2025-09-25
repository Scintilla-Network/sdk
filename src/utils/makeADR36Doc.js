import { utils } from "@scintilla-network/keys";
const { bech32 } = utils;
import { classic } from '@scintilla-network/hashes';
const { ripemd160, sha256 } = classic;
import {Buffer} from "buffer";
import uint8ArrayToBase64 from "./uint8ArrayToBase64.js";

export default function makeADR36Doc(message, publicKey){
    if(!publicKey){
        throw new Error('Public key is required for ADR36.');
    }
    let data = message;
    if(data.toUInt8Array){
        data = data.toUInt8Array({excludeAuthorization: true, excludeSignatures: true});
    }

    // expect publicKey to be a hex string, throw error if not
    if(typeof publicKey !== 'string'){
        throw new Error(`Public key must be a hex string. Received: ${typeof publicKey} - ${JSON.stringify(publicKey)}`);
    }

    const pubkeyBuffer = Buffer.from(publicKey, 'hex')
    const pubkeyhash = ripemd160(sha256(pubkeyBuffer));
    //@ts-ignore
    const signerPubKeyHash =  bech32.encode('sct', bech32.toWords(pubkeyhash)) // sct....

    const madeDoc =  {
        "chain_id": "",
        "account_number": "0",
        "sequence": "0",
        "fee": {
            "gas": "0",
            "amount": []
        },
        "msgs": [
            {
                "type": "sign/MsgSignData",
                "value": {
                    "signer": signerPubKeyHash,
                    "data": uint8ArrayToBase64(data),
                }
            }
        ],
        "memo": ""
    };

    return madeDoc;
}
