/**
 * @deprecated This function is deprecated. Use `toObject()` instead, which handles both arrays and objects.
 * This file is kept for backward compatibility and will be removed in a future version.
 * 
 * @example
 * // Old way (deprecated):
 * import { toArray } from './deserialize/toArray.js';
 * const result = toArray(bytes);
 * 
 * // New way (recommended):
 * import { toObject } from './deserialize/toObject.js';
 * const result = toObject(bytes);
 */

import { uint8array, varint } from '@scintilla-network/keys/utils';
import {llog} from '../llog.js';
import { NET_KINDS_ARRAY } from '../../primitives/messages/NetMessage/NET_KINDS.js';
import { toString } from './toString.js';
import {toVarInt} from './toVarInt.js';
import {toVarBigInt} from './toVarBigInt.js';
import {toBoolean} from './toBoolean.js';
import {toObject} from './toObject.js';
import { kindToConstructor } from '../kindToConstructor.js';
import { getFieldTypeFromBytes } from './getFieldTypeFromBytes.js';
/**
 * @deprecated Use `toObject()` instead. This function is kept for backward compatibility.
 * @param {Uint8Array} bytes - The bytes to deserialize
 * @returns {{value: Array, length: number}}
 */
function toArray(bytes) {
    // Delegate to toObject which now handles arrays
    return toObject(bytes);
}





export { toArray };
export default toArray;