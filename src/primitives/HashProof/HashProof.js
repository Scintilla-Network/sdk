import { uint8array, varint } from '@scintilla-network/keys/utils';
import { sha256 } from '@scintilla-network/hashes/classic';

import HashProofHeader from "./HashProofHeader.js";
import HashProofPayload from "./HashProofPayload.js";

import getTargetHash from "../../utils/getTargetHash.js";
import { Authorization } from '../Authorization/Authorization.js';
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';

class HashProof {
    /**
     * Create HashProof
     * @param {Object} options - The options
     * @param {string} options.cluster - The cluster
     * @param {Object} options.header - The header
     * @param {Object} options.payload - The payload
     * @returns {HashProof} The HashProof instance
     */
    constructor(options = {}) {
        this.kind = 'HASHPROOF';
        this.version = 1;
        this.cluster = options.cluster ?? '';
        this.header = new HashProofHeader(options?.header);
        this.payload = new HashProofPayload(options.payload ?? {data: []});
    }


    /**
     * Create HashProof from Uint8Array
     * @param {Uint8Array} inputArray - The input array
     * @returns {HashProof} The HashProof instance
     */
    static fromUint8Array(inputArray) {
        const hashProofProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['HASHPROOF']) {
            throw new Error(`Invalid element kind: ${elementKind}(${NET_KINDS_ARRAY[elementKind]}) - Expected: ${NET_KINDS['HASHPROOF']}(HASHPROOF)`);
        }
        hashProofProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = varint.decodeVarInt(inputArray.subarray(offset));
        hashProofProps.version = version;
        offset += versionLength;

         // Cluster
         const {value: clusterLength, length: clusterLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
         offset += clusterLengthBytes;
         const cluster = uint8array.toString(inputArray.subarray(offset, offset + clusterLength));
         offset += clusterLength;

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

        return new HashProof({cluster, header: header.toJSON(), payload: payload.toJSON()});
    }

    /**
     * Create HashProof from hex
     * @param {string} hex - The hex string
     * @returns {HashProof} The HashProof instance
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return HashProof.fromUint8Array(uint8Array);
    }

    /**
     * Generate Merkle root
     * @param {any[]} data - The data
     * @param {string} encoding - The encoding
     * @returns {Object} The Merkle root
     */
    static generateMerkleRoot(data, encoding = 'hex') {
        return HashProofPayload.generateMerkleRoot(data, encoding);
    }
    
    /**
     * Consider an element
     * @param {Object} element - The element
     */
    async consider(element) {
        if (!element || !element.type) {
            console.error('HashProof tried to consider an undefined or invalid element.');
            return;
        }
        this.payload.consider(element);

        this.header.merkleRoot = HashProof.generateMerkleRoot(this.payload.data, 'hex').hash;
    }

    /**
     * Convert to Uint8Array
     * @param {Object} options - The options
     * @param {boolean} options.excludeKindPrefix - Whether to exclude the kind prefix
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array(options = {}) {
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['HASHPROOF'], 'uint8array');
        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');

        const clusterUint8Array = uint8array.fromString(this.cluster);
        const clusterLengthUint8Array = varint.encodeVarInt(clusterUint8Array.length, 'uint8array');

        const headerUint8Array = this.header.toUint8Array();
        const headerLengthUint8Array = varint.encodeVarInt(headerUint8Array.length, 'uint8array');
        const payloadUint8Array = this.payload.toUint8Array();
        const payloadLengthUint8Array = varint.encodeVarInt(payloadUint8Array.length, 'uint8array');

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length)
            + versionUint8Array.length 
            + clusterLengthUint8Array.length + clusterUint8Array.length 
            + headerLengthUint8Array.length + headerUint8Array.length 
            + payloadLengthUint8Array.length + payloadUint8Array.length;

        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(clusterLengthUint8Array, offset); offset += clusterLengthUint8Array.length;
        result.set(clusterUint8Array, offset); offset += clusterUint8Array.length;
        result.set(headerLengthUint8Array, offset); offset += headerLengthUint8Array.length;
        result.set(headerUint8Array, offset); offset += headerUint8Array.length;
        result.set(payloadLengthUint8Array, offset); offset += payloadLengthUint8Array.length;
        result.set(payloadUint8Array, offset); offset += payloadUint8Array.length;
        
        return result;
    }

    /**
     * Convert to hex
     * @returns {string} The hex string
     */
    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    /**
     * Convert to hash
     * @param {string} encoding - The encoding
     * @returns {string} The hash
     */
    toHash(encoding = 'uint8array') {
        const array = this.toUint8Array();
        const hashUint8Array = sha256(array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    /**
     * Convert to JSON
     * @returns {Object} The JSON object
     */
    toJSON() {
        return {
            cluster: this.cluster,
            header: this.header.toJSON(),
            payload: this.payload.toJSON(),
        };
    }

    /**
     * Check nonce
     * @param {bigint} nonce - The nonce
     * @returns {Object} The nonce check result
     */
    checkNonce(nonce) {
        const targetHash = getTargetHash(this.header.difficulty);
        const clone = new HashProof({...this});
        clone.header.nonce = BigInt(nonce);
        const hash = clone.toHash('hex');
        return [hash < targetHash, clone];
    }

    /**
     * Sign the HashProof
     * @param {Wallet} signer - The signer
     * @returns {Promise<HashProof>} The signed HashProof
     */
    async sign(signer) {
        const auth = new Authorization();
        return auth.sign(this, signer);
    }

    /**
     * Validate the HashProof
     * @returns {Object} The validation result
     */
    isValid() {
        // Header validation
        const headerValidation = this.header.isValid();
        if (!headerValidation.valid) {
            return { valid: false, error: `Invalid header: ${headerValidation.error}` };
        }

        // Proposer validation - required for valid proofs
        if (!this.cluster) {
            return { valid: false, error: 'Cluster is required for valid proof' };
        }
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

export { HashProof };
export default HashProof;

