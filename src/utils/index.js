import {kindToConstructor} from './kindToConstructor.js';
import wait from './wait.js';

import getTargetHash from './getTargetHash.js';

// convenience export
import { uint8array, varint, varbigint, json, hex, utf8, base64 } from '@scintilla-network/keys/utils';

const excludingStringify = (obj, fieldsToExclude = []) => {
    const excludedObj = { ...obj };
    fieldsToExclude.forEach(field => {
        delete excludedObj[field];
    });
    return json.stringify(excludedObj);
}
const utils = {
    getTargetHash,
    wait,
    kindToConstructor,
    excludingStringify,

    uint8array,
    base64,
    varint,
    varbigint,
    json,
    hex,
    utf8,
}

export { 
    getTargetHash,
    wait,
    kindToConstructor,
    excludingStringify,

    uint8array,
    base64,
    varint,
    varbigint,
    json,
    hex,
    utf8,
 };

export { utils };
export default utils;