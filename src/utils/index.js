// import {toArray, toBoolean, toVarInt, toVarBigInt, toObject, toString} from './deserialize/index.js';
// import {fromArray, fromBoolean, fromVarInt, fromVarBigInt, fromObject, fromString} from './serialize/index.js';
import {kindToConstructor} from './kindToConstructor.js';
import kindObjectFromUint8Array from './kindObjectFromUint8Array.js';
import kindObjectToUint8Array from './kindObjectToUint8Array.js';
import wait from './wait.js';

// Serialize - using named imports to avoid circular dependency issues
import { toArray } from './deserialize/toArray.js';
import { toBoolean } from './deserialize/toBoolean.js';
import { toVarInt } from './deserialize/toVarInt.js';
import { toVarBigInt } from './deserialize/toVarBigInt.js';
import { toObject } from './deserialize/toObject.js';
import { toString } from './deserialize/toString.js';

import { fromArray } from './serialize/fromArray.js';
import { fromBoolean } from './serialize/fromBoolean.js';
import { fromVarInt } from './serialize/fromVarInt.js';
import { fromVarBigInt } from './serialize/fromVarBigInt.js';
import { fromObject } from './serialize/fromObject.js';
import { fromString } from './serialize/fromString.js';


// convenience export
import { uint8array, varint, varbigint, json, hex, utf8 } from '@scintilla-network/keys/utils';

const deserialize = {
    toArray: toArray,
    toBoolean: toBoolean,
    toVarInt: toVarInt,
    toVarBigInt: toVarBigInt,
    toObject: toObject,
    toString: toString,
}

const serialize = {
    fromArray: fromArray,
    fromBoolean: fromBoolean,
    fromVarInt: fromVarInt,
    fromVarBigInt: fromVarBigInt,
    fromObject: fromObject,
    fromString: fromString,
}

const excludingStringify = (obj, fieldsToExclude = []) => {
    const excludedObj = { ...obj };
    fieldsToExclude.forEach(field => {
        delete excludedObj[field];
    });
    return json.stringify(excludedObj);
}
const utils = {
    deserialize,
    serialize,
    kindToConstructor,
    kindObjectFromUint8Array,
    kindObjectToUint8Array,
    wait,
    uint8array,
    varint,
    varbigint,
    json,
    hex,
    utf8,
    excludingStringify,
}

export { 
    deserialize,
    serialize,
    kindToConstructor,
    kindObjectFromUint8Array,
    kindObjectToUint8Array,
    wait,
    uint8array,
    varint,
    varbigint,
    json,
    hex,
    utf8,
    excludingStringify,
 };

export { utils };
export default utils;