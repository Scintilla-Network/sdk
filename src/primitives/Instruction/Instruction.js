import { sha256 } from "@scintilla-network/hashes/classic";
import { serialize, deserialize } from '@scintilla-network/serialize';
import { uint8array, varint } from '@scintilla-network/keys/utils';

import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';

class Instruction {
    /**
     * Create Instruction
     * @param {Object} options - The options
     * @param {Object} options.data - The data
     * @returns {Instruction} The Instruction instance
     */
    constructor(options = {}) {
        this.kind = 'INSTRUCTION';
        this.data = options.data || {};
    }

    /**
     * Create Instruction from hex
     * @param {string} hex - The hex string
     * @returns {Instruction} The Instruction instance
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return this.fromUint8Array(uint8Array);
    }

    /**
     * Create Instruction from Uint8Array
     * @param {Uint8Array} uint8Array - The Uint8Array
     * @returns {Instruction} The Instruction instance
     */
    static fromUint8Array(uint8Array) {
        let offset = 0;
        const kind = varint.decodeVarInt(uint8Array.subarray(offset, 10));
        const kindString = NET_KINDS_ARRAY[kind.value];
        if (kindString.toUpperCase() !== 'INSTRUCTION') {
            throw new Error('Invalid instruction kind');
        }
        offset += 1;

        const totalLength = varint.decodeVarInt(uint8Array.subarray(offset, 10));
        offset += 1;
        const dataUint8Array = uint8Array.subarray(offset, offset + totalLength.value);
        const dataResult = deserialize.toObject(dataUint8Array);

        return new Instruction({
            kind,
            data: dataResult.value,
        });
    }

    /**
     * Create Instruction from JSON
     * @param {Object} json - The JSON object
     * @returns {Instruction} The Instruction instance
     */
    static fromJSON(json) {
        return new Instruction(json);
    }

    /**
     * Convert to JSON
     * @returns {Object} The JSON object
     */
    toJSON() {
        return {
            kind: this.kind,
            data: this.data,
        };
    }

    /**
     * Convert to Uint8Array
     * @param {Object} options - The options
     * @param {boolean} options.excludeKindPrefix - Whether to exclude the kind prefix
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array({ excludeKindPrefix = false } = {}) {
        // let kindUint8ArrayBytes = new Uint8Array(0);
        // if(!excludeKindPrefix){
        //     const {value: kindUint8ArrayBytes, length: kindUint8ArrayBytesLength} = serialize.fromVarInt(NET_KINDS['INSTRUCTION'], 'uint8array');
        // }
        const kindUint8ArrayBytes = excludeKindPrefix ? new Uint8Array(0) : serialize.fromVarInt(NET_KINDS['INSTRUCTION'], 'uint8array').value;

        const dataSerialized = serialize.fromObject(this.data);
        const {value: totalLengthBytes, length: totalLengthBytesLength} = serialize.fromVarInt(dataSerialized.length, 'uint8array');

        const result = new Uint8Array(kindUint8ArrayBytes.length + totalLengthBytes.length + dataSerialized.length);
        result.set(kindUint8ArrayBytes, 0);
        result.set(totalLengthBytes, kindUint8ArrayBytes.length);
        result.set(dataSerialized.value, kindUint8ArrayBytes.length + totalLengthBytes.length);
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
     * Convert to hex
     * @returns {string} The hex string
     */
    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }


    /**
     * Convert to string
     * @returns {string} The string
     */
    toString() {
        return this.toHex();
    }

}

export { Instruction };
export default Instruction;
