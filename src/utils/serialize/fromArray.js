/**
 * @deprecated This function is deprecated. Use `fromObject()` instead, which handles both arrays and objects.
 * This file is kept for backward compatibility and will be removed in a future version.
 * 
 * @example
 * // Old way (deprecated):
 * import { fromArray } from './serialize/fromArray.js';
 * const result = fromArray([1, 2, 3]);
 * 
 * // New way (recommended):
 * import { fromObject } from './serialize/fromObject.js';
 * const result = fromObject([1, 2, 3]);
 */

import { NET_KINDS } from '../../primitives/messages/NetMessage/NET_KINDS.js';
import { fromVarInt } from './fromVarInt.js';
import { fromObject } from './fromObject.js';
import { uint8array, json } from '@scintilla-network/keys/utils';
import { fromString } from './fromString.js';
import { fromVarBigInt } from './fromVarBigInt.js';
import { fromBoolean } from './fromBoolean.js';
import llog from '../llog.js';

// const fieldsTypes = sortedFields.map(field => {
//     const type = typeof input[field];

//     switch(type){
//         case 'bigint':
//             return 'bigint';
//         case 'object':
//             if (Array.isArray(input[field])) {
//                 return 'array';
//             }
//             return 'object';
//         case 'number':
//             return 'varint';
//         default:
//             return type;
//     }
// });

function getFieldTypeBytes(item){
    const result = {
        bytes: new Uint8Array([]),
        length: 0,
        type: null,
    }
    const type = typeof item;
    switch(type){
        case "string":
            result.bytes = new Uint8Array([80]); // 0x50
            result.length = result.bytes.length;
            result.type = "string";
            return result;
        case "varint":
        case "number":
            result.bytes = new Uint8Array([81]); // 0x51
            result.length = result.bytes.length;
            result.type = "varint";
            return result;
        case "bigint":
            result.bytes = new Uint8Array([82]); // 0x52
            result.length = result.bytes.length;
            result.type = "bigint";
            return result;
        case "boolean":
            result.bytes = new Uint8Array([85]); // 0x55
            result.length = result.bytes.length;
            result.type = "boolean";
            return result;
        case "object":
        case "array":
            if (Array.isArray(item)) {
                result.bytes = new Uint8Array([83]); // 0x53
                result.length = result.bytes.length;
                result.type = "array";
                return result;
            }
            result.bytes = new Uint8Array([84]); // 0x54
            result.length = result.bytes.length;
            result.type = "object";
            return result;
        default:
            throw new Error(`Unsupported item type ${type}`);
    }

    return result;
}

/**
 * @deprecated Use `fromObject()` instead. This function is kept for backward compatibility.
 * @param {Array} input - The array to serialize
 * @returns {{value: Uint8Array, length: number}}
 */
function fromArray(input) {
    // Delegate to fromObject which now handles arrays
    return fromObject(input);
}

export { fromArray };
export default fromArray;