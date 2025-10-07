import { varint } from '@scintilla-network/keys/utils';
import { NET_KINDS_ARRAY } from '../primitives/messages/NetMessage/NET_KINDS.js';
import { kindToConstructor } from './kindToConstructor.js';

function kindObjectFromUint8Array(data) {
    let offset = 0;
    const {value: kindValue, length: kindValueLength} = varint.decodeVarInt(data.subarray(offset));
    const kind = NET_KINDS_ARRAY[kindValue];
    offset += kindValueLength;
 
    const constructor = kindToConstructor(kind);
    return constructor.fromUint8Array(data);
}

export { kindObjectFromUint8Array };
export default kindObjectFromUint8Array;