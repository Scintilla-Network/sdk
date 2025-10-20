import { sha256 } from "@scintilla-network/hashes/classic";
import { uint8array, varint } from '@scintilla-network/keys/utils';

class DriveData {
    constructor(options = {}) {
        this.type = options.type || 'text';
        this.content = options.content || '';
    }

    static fromJSON(json) {
        return new DriveData(json);
    }

    toJSON() {
        return {
            type: this.type,
            content: this.content,
        };
    }

    toUint8Array() {
        const typeUint8Array = this.type ? uint8array.fromString(this.type) : new Uint8Array(0);
        const varIntType = varint.encodeVarInt(typeUint8Array.length);

        const contentUint8Array = this.content ? uint8array.fromString(this.content) : new Uint8Array(0);
        const varIntContent = varint.encodeVarInt(contentUint8Array.length);

        const totalLength = varIntType.length + typeUint8Array.length + varIntContent.length + contentUint8Array.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        result.set(varIntType, offset); offset += varIntType.length;
        result.set(typeUint8Array, offset); offset += typeUint8Array.length;
        result.set(varIntContent, offset); offset += varIntContent.length;
        result.set(contentUint8Array, offset);
        
        return result;
    }

    toHash(encoding = 'uint8array') {  
        const uint8Array = this.toUint8Array();
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return this.fromUint8Array(uint8Array);
    }

    static fromUint8Array(uint8Array) {
        try {
            let offset = 0;
            const { value: _typeLength, length: _varIntTypeLength } = varint.decodeVarInt(uint8Array);
            const typeLength = Number(_typeLength);
            const varIntTypeLength = _varIntTypeLength;
            offset += varIntTypeLength;
            
            const typeUint8Array = uint8Array.slice(offset, offset + typeLength);
            const type = uint8array.toString(typeUint8Array);
            offset += typeLength;

            const { value: _contentLength, length: varIntContentLength } = varint.decodeVarInt(uint8Array.slice(offset));
            const contentLength = Number(_contentLength);
            offset += varIntContentLength;
            
            const contentUint8Array = uint8Array.slice(offset, offset + contentLength);
            const content = uint8array.toString(contentUint8Array);

            return new DriveData({
                type,
                content,
            });
        } catch (e) {
            console.error(e);
            return new DriveData(); // Return a default instance in case of error
        }
    }

    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    toString() {
        return this.toHex();
    }
}

export { DriveData };
export default DriveData;
