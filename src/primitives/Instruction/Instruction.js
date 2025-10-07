import { sha256 } from "@scintilla-network/hashes/classic";
import { uint8array, varint, varbigint, json } from '@scintilla-network/keys/utils';

import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';

const KEY_TYPES = {
    STRING: 0,
    VARBIGINT: 1,
    VARINT: 2,
    OBJECT: 3,
}


function deserialize(data) {
    let offset = 0;
    const fieldsAmount = varint.decodeVarInt(data.subarray(offset));
    offset += fieldsAmount.length;

    const fields = [];
    const values = [];

    for(let i = 0; i < fieldsAmount.value; i++) {
        const fieldNameLengthBytes = varint.decodeVarInt(data.subarray(offset));
        offset += fieldNameLengthBytes.length;
        const fieldName = uint8array.toString(data.subarray(offset, offset + fieldNameLengthBytes.value));
        offset += fieldNameLengthBytes.value;
        fields.push(fieldName);
    }

    for(let i = 0; i < fieldsAmount.value; i++) {
        // field value length
        const fieldValueLengthBytes = varint.decodeVarInt(data.subarray(offset));
        offset += fieldValueLengthBytes.length;

        // field value type
        const fieldValueTypeBytes = varint.decodeVarInt(data.subarray(offset));
        offset += fieldValueTypeBytes.length;

        // field value
        const fieldValueBytes = data.subarray(offset, offset + fieldValueLengthBytes.value);
        offset += fieldValueLengthBytes.value;

        let value;
        switch(fieldValueTypeBytes.value) {
            case KEY_TYPES.STRING:
                value = uint8array.toString(fieldValueBytes);
                break;
            case KEY_TYPES.VARBIGINT:
                value = varbigint.decodeVarBigInt(fieldValueBytes);
                value = value.value;
                break;
            case KEY_TYPES.VARINT:
                value = varint.decodeVarInt(fieldValueBytes);
                value = value.value;
                break;
            case KEY_TYPES.OBJECT:
                value = json.parse(uint8array.toString(fieldValueBytes));

                break;
            default:
                throw new Error('Unsupported field type');
        }
        values.push(value);
    }

    return { fields, values };
}


function serialize(data) {
    const fields = Object.keys(data);
    const fieldsTypes = fields.map(field => typeof data[field]);
    const fieldsValues = fields.map(field => data[field]);

    const fieldsAmount = fields.length;
    const fieldsAmountBytes = varint.encodeVarInt(fieldsAmount, 'uint8array');

    let fieldsNamesBytes = [];
    let fieldsValuesBytes = [];

    for(let i = 0; i < fields.length; i++) {
        const fieldName = fields[i];
        const fieldValue = data[fieldName];
        
        // We store fieldLength
        const fieldLengthBytes = varint.encodeVarInt(fieldName.length, 'uint8array');

        fieldsNamesBytes.push(fieldLengthBytes);
        fieldsNamesBytes.push(uint8array.fromString(fieldName));
        
        // We store fieldValue
        let fieldValueBytes;
        let fieldValueTypeBytes;
        switch(typeof fieldValue) {
            case 'string':
                fieldValueBytes = uint8array.fromString(fieldValue);
                fieldValueTypeBytes = varint.encodeVarInt(KEY_TYPES.STRING, 'uint8array');
                break;
            case 'bigint':
                fieldValueBytes = varbigint.encodeVarBigInt(fieldValue, 'uint8array');
                fieldValueTypeBytes = varint.encodeVarInt(KEY_TYPES.VARBIGINT, 'uint8array');
                break;
            case 'number':
                fieldValueBytes = varint.encodeVarInt(fieldValue, 'uint8array');
                fieldValueTypeBytes = varint.encodeVarInt(KEY_TYPES.VARINT, 'uint8array');
                break;
            case 'object':
                fieldValueBytes = uint8array.fromString(json.stringify(fieldValue));
                fieldValueTypeBytes = varint.encodeVarInt(KEY_TYPES.OBJECT, 'uint8array');

                break;
            default:
                throw new Error(`Unsupported field type ${typeof fieldValue} - ${json.stringify(fieldValue)}`);
        }

        const fieldValueLengthBytes = varint.encodeVarInt(fieldValueBytes.length, 'uint8array');
        fieldsValuesBytes.push(fieldValueLengthBytes);
        fieldsValuesBytes.push(fieldValueTypeBytes);
        fieldsValuesBytes.push(fieldValueBytes);
    }

    fieldsNamesBytes = fieldsNamesBytes.reduce((acc, value) => acc = new Uint8Array([...acc, ...value]), new Uint8Array());
    fieldsValuesBytes = fieldsValuesBytes.reduce((acc, value) => acc = new Uint8Array([...acc, ...value]), new Uint8Array());

    const totalLength = fieldsAmountBytes.length + fieldsNamesBytes.length + fieldsValuesBytes.length;
    const result = new Uint8Array(totalLength);
    let offset = 0;
    result.set(fieldsAmountBytes, offset);
    offset += fieldsAmountBytes.length;
    result.set(fieldsNamesBytes, offset);
    offset += fieldsNamesBytes.length;
    result.set(fieldsValuesBytes, offset);
    offset += fieldsValuesBytes.length;
    
    return result;

}



class Instruction {
    constructor(options = {}) {
        this.kind = 'INSTRUCTION';
        this.data = options.data || {};
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return this.fromUint8Array(uint8Array);
    }

    static fromUint8Array(uint8Array) {
        let offset = 0;
        const kind = varint.decodeVarInt(uint8Array.subarray(offset,10));
        const kindString = NET_KINDS_ARRAY[kind.value];
        if(kindString.toUpperCase() !== 'INSTRUCTION') {
            throw new Error('Invalid instruction kind');
        }
        offset += 1;

        const totalLength = varint.decodeVarInt(uint8Array.subarray(offset, 10));
        offset += 1;
        const dataUint8Array = uint8Array.subarray(offset, offset + totalLength.value);
        const { fields, values } = deserialize(dataUint8Array);

        const data = {};
        for(let i = 0; i < fields.length; i++) {
            data[fields[i]] = values[i];
        }

        return new Instruction({
            kind,
            data,
        });
    }

    static fromJSON(json) {
        return new Instruction(json);
    }

    toJSON() {
        return {
            kind: this.kind,
            data: this.data,
        };
    }

    toUint8Array({ excludeKindPrefix = false } = {}) {
        const kindUint8ArrayBytes = excludeKindPrefix ? new Uint8Array(0) : varint.encodeVarInt(NET_KINDS['INSTRUCTION'], 'uint8array');

        const dataUint8Array = serialize(this.data);
        const totalLengthBytes = varint.encodeVarInt(dataUint8Array.length, 'uint8array');


        const result = new Uint8Array(kindUint8ArrayBytes.length + totalLengthBytes.length + dataUint8Array.length);
        result.set(kindUint8ArrayBytes, 0);
        result.set(totalLengthBytes, kindUint8ArrayBytes.length);
        result.set(dataUint8Array, kindUint8ArrayBytes.length + totalLengthBytes.length);
        return result;
    }

    toHash(encoding = 'hex') {  
        const uint8Array = this.toUint8Array();
        const hash = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hash) : uint8array.toString(hash);
    }

    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }


    toString() {
        return this.toHex();
    }

}

export { Instruction };
export default Instruction;
