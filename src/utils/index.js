// import {toArray, toBoolean, toVarInt, toVarBigInt, toObject, toString} from './deserialize/index.js';
// import {fromArray, fromBoolean, fromVarInt, fromVarBigInt, fromObject, fromString} from './serialize/index.js';
import {kindToConstructor} from './kindToConstructor.js';
import kindObjectFromUint8Array from './kindObjectFromUint8Array.js';
import kindObjectToUint8Array from './kindObjectToUint8Array.js';
import wait from './wait.js';

// Serialize - using named imports to avoid circular dependency issues
import { toBoolean } from './deserialize/toBoolean.js';
import { toVarInt } from './deserialize/toVarInt.js';
import { toVarBigInt } from './deserialize/toVarBigInt.js';
import { toObject } from './deserialize/toObject.js';
import { toString } from './deserialize/toString.js';

import { fromBoolean } from './serialize/fromBoolean.js';
import { fromVarInt } from './serialize/fromVarInt.js';
import { fromVarBigInt } from './serialize/fromVarBigInt.js';
import { fromObject } from './serialize/fromObject.js';
import { fromString } from './serialize/fromString.js';

import getTargetHash from './getTargetHash.js';
import exportDoc from './exportDoc.js';
import importDoc from './importDoc.js';
import makeADR36Doc from './makeADR36Doc.js';
import makeDoc from './makeDoc.js';
import signDoc from './signDoc.js';
import stringifiedJsonArrayify from './stringifiedJsonArrayify.js';
import uint8ArrayToBase64 from './uint8ArrayToBase64.js';
import verifyDoc from './verifyDoc.js';

// convenience export
import { uint8array, varint, varbigint, json, hex, utf8 } from '@scintilla-network/keys/utils';

const deserialize = {
    toBoolean: toBoolean,
    toVarInt: toVarInt,
    toVarBigInt: toVarBigInt,
    toObject: toObject,
    toString: toString,
}

const serialize = {
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
    getTargetHash,
    exportDoc,
    importDoc,
    makeADR36Doc,
    makeDoc,
    signDoc,
    stringifiedJsonArrayify,
    uint8ArrayToBase64,
    verifyDoc,
    wait,

    deserialize,
    serialize,
    kindToConstructor,
    kindObjectFromUint8Array,
    kindObjectToUint8Array,
    uint8array,
    varint,
    varbigint,
    json,
    hex,
    utf8,
    excludingStringify,
}

export { 
    getTargetHash,
    exportDoc,
    importDoc,
    makeADR36Doc,
    makeDoc,
    signDoc,
    stringifiedJsonArrayify,
    uint8ArrayToBase64,
    verifyDoc,
    wait,

    deserialize,
    serialize,
    kindToConstructor,
    kindObjectFromUint8Array,
    kindObjectToUint8Array,
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