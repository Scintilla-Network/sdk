import { sha256} from '@scintilla-network/hashes/classic';
import { uint8array, varint, varbigint }  from '@scintilla-network/keys/utils';

export class ClusterBlockHeader {
    /**
     * Create ClusterBlockHeader
     * @param {Object} options - The options
     * @param {number} options.height - The height
     * @param {BigInt} options.timestamp - The timestamp
     * @param {Uint8Array} options.previousHash - The previous hash
     * @param {string} options.proposer - The proposer
     * @returns {ClusterBlockHeader} The ClusterBlockHeader instance
     */
    constructor(options = {}) {
        this.height = options.height ?? 0;
        this.timestamp = options.timestamp ? BigInt(options.timestamp) : BigInt(Date.now());
        this.previousHash = options.previousHash ?? new Uint8Array(32).fill(0);
        this.proposer = options.proposer ?? '';
    }

    /**
     * Convert to Uint8Array
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array() {
        const heightUint8Array = varint.encodeVarInt(this.height, 'uint8array');
        const timestampUint8Array = varbigint.encodeVarBigInt(this.timestamp, 'uint8array');
        const previousHashUint8Array = this.previousHash ? this.previousHash : new Uint8Array(32).fill(0);

        const proposerUint8Array = uint8array.fromString(this.proposer);
        const proposerLengthUint8Array = varint.encodeVarInt(proposerUint8Array.length, 'uint8array');

        const totalLength = heightUint8Array.length + timestampUint8Array.length + previousHashUint8Array.length + proposerLengthUint8Array.length + proposerUint8Array.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;

        result.set(heightUint8Array, offset); offset += heightUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;
        result.set(previousHashUint8Array, offset); offset += previousHashUint8Array.length;
        result.set(proposerLengthUint8Array, offset); offset += proposerLengthUint8Array.length;
        result.set(proposerUint8Array, offset); offset += proposerUint8Array.length;
        return result;
    }

    /**
     * Convert to hash
     * @param {string} encoding - The encoding
     * @returns {string} The hash
     */
    toHash(encoding = 'uint8array') {
        const uint8Array = this.toUint8Array();
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    /**
     * Create ClusterBlockHeader from Uint8Array
     * @param {Uint8Array} inputArray - The Uint8Array
     * @returns {ClusterBlockHeader} The ClusterBlockHeader instance
     */
    static fromUint8Array(inputArray) {
        let offset = 0;

        const height = varint.decodeVarInt(inputArray.subarray(offset));
        offset += height.length;

        const timestamp = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        offset += timestamp.length;

        const previousHashEnd = offset + 32; // 32 bytes for previous hash
        const previousHashUint8Array = inputArray.subarray(offset, previousHashEnd);
        offset = previousHashEnd;

      
        const { value: proposerLength, length: varIntLength } = varint.decodeVarInt(inputArray.subarray(offset));
        offset += varIntLength;

        const proposerUint8Array = inputArray.subarray(offset);
        const proposer = uint8array.toString(proposerUint8Array);

        return new ClusterBlockHeader({
            height: height.value,
            timestamp: BigInt(timestamp.value),
            previousHash: previousHashUint8Array,
            proposer: proposer,
        });
    }

    /**
     * Convert to JSON
     * @returns {Object} The JSON object
     */
    toJSON() {
        return {
            height: this.height,
            timestamp: this.timestamp.toString(),
            previousHash: this.previousHash,
            proposer: this.proposer,
        };
    }
}

