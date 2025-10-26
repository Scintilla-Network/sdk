import { sha256 } from '@scintilla-network/hashes/classic';
import { uint8array } from '@scintilla-network/keys/utils';
import { serialize, deserialize } from '@scintilla-network/serialize';

export class RelayBlockHeader {
    /**
     * Create RelayBlockHeader
     * @param {Object} options - The options
     * @param {number} options.epoch - The epoch
     * @param {number} options.timestamp - The timestamp
     * @param {string} options.previousHash - The previous hash
     * @param {string} options.proposer - The proposer
     * @param {string} options.merkleRoot - The merkle root
     */
    constructor(options = {}) {
        this.epoch = options.epoch ?? 0;
        this.timestamp = options.timestamp ? BigInt(options.timestamp) : BigInt(Date.now());
        this.previousHash = options.previousHash ? (options.previousHash instanceof Uint8Array ? uint8array.toHex(options.previousHash) : options.previousHash) : uint8array.toHex(new Uint8Array(32).fill(0));
        this.proposer = options.proposer ?? null;
        this.merkleRoot = options.merkleRoot ?? uint8array.toHex(new Uint8Array(32).fill(0));
    }

     /**
     * Create RelayBlockHeader from Uint8Array
     * @param {Uint8Array} inputArray - The Uint8Array
     * @returns {RelayBlockHeader} The RelayBlockHeader instance
     */
     static fromUint8Array(inputArray) {
        let offset = 0;
        const headerProps = {};

        const { value: epoch, length: epochLength } = deserialize.toVarInt(inputArray.subarray(offset));
        offset += epochLength;
        headerProps.epoch = epoch;

        const { value: timestamp, length: timestampLength } = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += timestampLength;
        headerProps.timestamp = timestamp;

        const { value: previousHash, length: previousHashLength } = deserialize.toString(inputArray.subarray(offset));
        offset += previousHashLength;
        headerProps.previousHash = previousHash;

        const { value: proposer, length: proposerLength } = deserialize.toString(inputArray.subarray(offset));
        offset += proposerLength;
        headerProps.proposer = proposer;

        const merkleRoot = inputArray.subarray(offset);
        offset += merkleRoot.length;
        headerProps.merkleRoot = merkleRoot;

        return new RelayBlockHeader(headerProps);
    }


    /**
     * Create RelayBlockHeader from JSON
     * @param {Object} json - The JSON object
     * @returns {RelayBlockHeader} The RelayBlockHeader instance
     */
    static fromJSON(json) {
        return new RelayBlockHeader({
            epoch: json.epoch,
            timestamp: BigInt(json.timestamp),
            previousHash: uint8array.fromHex(json.previousHash),
            proposer: json.proposer,
        });
    }

    
    /**
     * Convert to Uint8Array
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array() {
        const {value: epochUint8Array, length: epochLength} = serialize.fromVarInt(this.epoch, 'uint8array');
        const {value: timestampUint8Array, length: timestampLength} = serialize.fromVarBigInt(this.timestamp, 'uint8array');
        const {value: previousHashUint8Array, length: previousHashLength} = serialize.fromString(this.previousHash, 'uint8array');
        const {value: proposerUint8Array, length: proposerLength} = serialize.fromString(this.proposer, 'uint8array');
        const merkleRootUint8Array = this.merkleRoot;

        const totalLength = 0
        + epochLength 
        + timestampLength 
        + previousHashLength
        + proposerLength
        + merkleRootUint8Array.length;

        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        result.set(epochUint8Array, offset); offset += epochLength;
        result.set(timestampUint8Array, offset); offset += timestampLength;
        result.set(previousHashUint8Array, offset); offset += previousHashLength;
        result.set(proposerUint8Array, offset); offset += proposerLength;
        result.set(merkleRootUint8Array, offset); offset += merkleRootUint8Array.length;
        
        return result;
    }

    /**
     * Convert to Hash
     * @param {string} encoding - The encoding
     * @returns {string} The Hash string
     */
    toHash(encoding = 'uint8array') {
        const uint8Array = this.toUint8Array();
        const hash = sha256(uint8Array);
        return encoding === 'uint8array' ? hash : uint8array.toHex(hash);
    }

   
    /**
     * Convert to JSON
     * @returns {Object} The JSON object
     */
    toJSON() {
        return {
            epoch: this.epoch,
            timestamp: this.timestamp,
            previousHash: uint8array.toHex(this.previousHash),
            proposer: this.proposer,
            merkleRoot: this.merkleRoot,
        };
    }
}

export default RelayBlockHeader;

