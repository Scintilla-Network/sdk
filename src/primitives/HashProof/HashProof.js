import HashProofHeader from "./HashProofHeader.js";
import HashProofPayload from "./HashProofPayload.js";
import { sha256 } from '@scintilla-network/hashes/classic';
// @ts-ignore
import {Tree} from "@truestamp/tree";
import getTargetHash from "../../utils/getTargetHash.js";
import signDoc from "../../utils/signDoc.js";
import makeDoc from "../../utils/makeDoc.js";
import { uint8array, varint, json, varbigint } from '@scintilla-network/keys/utils';
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';

class HashProof {
    constructor(options = {}) {
        this.kind = 'HASHPROOF';
        this.version = 1;
        this.header = new HashProofHeader(options?.header);
        this.payload = new HashProofPayload(options.payload ?? {data: []});
    }

    async consider(element) {
        if (!element || !element.type) {
            console.error('HashProof tried to consider an undefined or invalid element.');
            return;
        }
        this.payload.consider(element);

        this.header.merkleRoot = HashProof.generateMerkleRoot(this.payload.data, 'hex').hash;
    }

    toUint8Array(options = {}) {
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['HASHPROOF'], 'uint8array');
        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');

        const headerUint8Array = this.header.toUint8Array();
        const headerLengthUint8Array = varint.encodeVarInt(headerUint8Array.length, 'uint8array');
        const payloadUint8Array = this.payload.toUint8Array();
        const payloadLengthUint8Array = varint.encodeVarInt(payloadUint8Array.length, 'uint8array');

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length)
            + versionUint8Array.length 
            + headerLengthUint8Array.length + headerUint8Array.length 
            + payloadLengthUint8Array.length + payloadUint8Array.length;

        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(headerLengthUint8Array, offset); offset += headerLengthUint8Array.length;
        result.set(headerUint8Array, offset); offset += headerUint8Array.length;
        result.set(payloadLengthUint8Array, offset); offset += payloadLengthUint8Array.length;
        result.set(payloadUint8Array, offset); offset += payloadUint8Array.length;
        
        return result;
    }

    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    toHash(encoding = 'hex') {
        const array = this.toUint8Array();
        const hashUint8Array = sha256(array);
        return encoding === 'hex' ? uint8array.toHex(hashUint8Array) : uint8array.toString(hashUint8Array);
    }

    static fromUint8Array(inputArray) {
        const hashProofProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['HASHPROOF']) {
            throw new Error('Invalid element kind');
        }
        hashProofProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = varint.decodeVarInt(inputArray.subarray(offset));
        hashProofProps.version = version;
        offset += versionLength;

        // Header
        const {value: headerLength, length: headerLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += headerLengthBytes;
        const headerUint8Array = inputArray.slice(offset, offset + headerLength);
        const header = HashProofHeader.fromUint8Array(headerUint8Array);
        offset += headerLength;

        // Payload
        const {value: payloadLength, length: payloadLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += payloadLengthBytes;
        const payloadUint8Array = inputArray.slice(offset, offset + payloadLength);
        const payload = HashProofPayload.fromUint8Array(payloadUint8Array);
        offset += payloadLength;

        return new HashProof({header: header.toJSON(), payload: payload.toJSON()});
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return HashProof.fromUint8Array(uint8Array);
    }

    static generateMerkleRoot(data, encoding = 'hex') {
        const hashes = data.map((el) => uint8array.fromHex(el.toHash()));
        const tree = new Tree(hashes, 'sha256', {requireBalanced: false, debug: false});
        const root = tree.root();
        const proofs = data.map((el) => {
            return {
                hash: el.toHash('hex'),
                proof: tree.proofObject(uint8array.fromHex(el.toHash('hex')))
            }
        });

        return {hash: uint8array.toHex(new Uint8Array(root)), proofs};
    }

    toJSON() {
        return {
            header: this.header.toJSON(),
            payload: this.payload.toJSON(),
        };
    }

    checkNonce(nonce) {
        const targetHash = getTargetHash(this.header.difficulty);
        const clone = new HashProof({...this});
        clone.header.nonce = BigInt(nonce);
        const hash = clone.toHash('hex');
        return [hash < targetHash, clone];
    }

    toDoc(signer) {
        return makeDoc(this, signer);
    }

    async sign(signer) {
        return signDoc(await this.toDoc(signer));
    }

    isValid() {
        // Header validation
        const headerValidation = this.header.isValid();
        if (!headerValidation.valid) {
            return { valid: false, error: `Invalid header: ${headerValidation.error}` };
        }

        // Proposer validation - required for valid proofs
        if (!this.header.proposer) {
            return { valid: false, error: 'Proposer is required for valid proof' };
        }

        // Comprehensive payload validation (handles element validation, ordering, etc.)
        const payloadValidation = this.payload.isValid();
        if (!payloadValidation.valid) {
            return { valid: false, error: `Invalid payload: ${payloadValidation.error}` };
        }

        // Merkle root verification using payload's built-in method
        const merkleRootValidation = this.payload.verifyMerkleRoot(this.header.merkleRoot);
        if (!merkleRootValidation.valid) {
            return { valid: false, error: `Merkle root validation failed: ${merkleRootValidation.error}` };
        }

        // Proof-of-work validation - check if nonce produces valid hash
        if (!this.checkNonce(this.header.nonce)) {
            return { valid: false, error: 'Invalid proof-of-work: nonce does not produce valid hash for given difficulty' };
        }

        // Chain consistency validation (genesis block should have null previous hash, non-genesis block must have previous hash)
        if (this.header.height === 0 && this.header.previousHash !== null) {
            return { valid: false, error: 'Genesis block should have null previous hash' };
        } else if (this.header.height > 0 && this.header.previousHash === null) {
            return { valid: false, error: 'Non-genesis block must have previous hash' };
        }

        // Version compatibility check (only 1 version supported)
        const supportedVersions = [1];
        if (!supportedVersions.includes(this.header.version)) {
            return { valid: false, error: `Unsupported version: ${this.header.version}. Supported versions: ${supportedVersions.join(', ')}` };
        }

        return { valid: true };
    }
}

export default HashProof;

