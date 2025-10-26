import { sha256 } from "@scintilla-network/hashes/classic";
import { serialize, deserialize } from '@scintilla-network/serialize';
import { uint8array } from '@scintilla-network/keys/utils';

const VALID_TYPES = [
    'text',
    'json',
    'binary',
    'document',
    'image',
    'video'
];

class DriveData {
    /**
     * Create DriveData
     * @param {Object} options - The options
     * @param {string} options.type - The type
     * @param {string} options.content - The content
     * @returns {DriveData} The DriveData instance
     */
    constructor(options = {}) {
        const type = options.type !== undefined ? options.type : 'text';

        if (!DriveData.isValidType(type)) {
            throw new Error(`Invalid type: "${type}". Valid types are: ${VALID_TYPES.join(', ')}, or "other:customtype" format.`);
        }

        this.type = type;
        this.content = options.content !== undefined ? options.content : '';
    }

    /**
     * Create DriveData from JSON
     * @param {Object} json - The JSON object
     * @returns {DriveData} The DriveData instance
     */
    static fromJSON(json) {
        return new DriveData(json);
    }

    /**
     * Get valid types
     * @returns {string[]} The valid types
     */
    static getValidTypes() {
        return [...VALID_TYPES];
    }

    /**
     * Check if a type is valid
     * @param {string} type - The type
     * @returns {boolean} True if the type is valid
     */
    static isValidType(type) {
        if (!type || typeof type !== 'string') {
            return false;
        }
    
        if (VALID_TYPES.includes(type)) {
            return true;
        }
    
        if (type.startsWith('other:')) {
            const suffix = type.substring(6); 
            return suffix.length > 0 && /^[a-zA-Z0-9._-]+$/.test(suffix);
        }
    
        return false;
    }


    /**
     * Convert to JSON
     * @returns {Object} The JSON object
     */
    toJSON() {
        return {
            type: this.type,
            content: this.content,
        };
    }

    /**
     * Convert to Uint8Array
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array() {
        const typeSerialized = serialize.fromString(this.type);
        const contentSerialized = serialize.fromString(this.content);

        const totalLength = typeSerialized.length + contentSerialized.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;

        result.set(typeSerialized.value, offset); offset += typeSerialized.length;
        result.set(contentSerialized.value, offset);

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
     * Create DriveData from hex
     * @param {string} hex - The hex string
     * @returns {DriveData} The DriveData instance
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return this.fromUint8Array(uint8Array);
    }

    /**
     * Create DriveData from Uint8Array
     * @param {Uint8Array} uint8Array - The Uint8Array
     * @returns {DriveData} The DriveData instance
     */
    static fromUint8Array(uint8Array) {
        if (!uint8Array || uint8Array.length === 0) {
            throw new Error('Empty input data');
        }

        if (uint8Array.length < 2) {
            throw new Error('Insufficient data length');
        }

        let offset = 0;
        const typeResult = deserialize.toString(uint8Array.subarray(offset));

        if (!DriveData.isValidType(typeResult.value)) {
            throw new Error(`Invalid type extracted from data: "${typeResult.value}"`);
        }

        const type = typeResult.value;
        offset += typeResult.length;

        const contentResult = deserialize.toString(uint8Array.subarray(offset));
        const content = contentResult.value;

        return new DriveData({
            type,
            content,
        });
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

export { DriveData };
export default DriveData;
