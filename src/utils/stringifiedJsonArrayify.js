import { utils } from '@scintilla-network/keys';
const { json, uint8array } = utils;

/**
 * Convert a JSON object to a Uint8Array
 * @param {any} input - The JSON object to convert
 * @returns {Uint8Array} The Uint8Array
 */
export default function stringifiedJsonArrayify(input) {
    return uint8array.fromString(json.stringify(input));
}