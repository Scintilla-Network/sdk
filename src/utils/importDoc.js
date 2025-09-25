import { NetMessage } from "../primitives/messages/NetMessage/NetMessage.js";
import Transfer from "../primitives/Transfer/Transfer.js";

/**
 * Import a document from a hex string
 * @param {string} hex - The hex string to import
 * @returns {Object} The imported document
 */
export default function importDoc(hex){
    const netMessage = NetMessage.fromHex(hex);

    const payload = netMessage.payload;

    if(!payload){
        throw new Error('No payload found in document');
    }

    const buffer = (Buffer.isBuffer(payload)) ? payload : Buffer.from(payload, 'hex');

    const doc = {
        message: netMessage,
        element: null,
        hex,
    }   

    switch(netMessage.kind){
        case 'TRANSFER':
            doc.element = Transfer.fromBuffer(buffer);
            break;
        default:
            throw new Error('Unsupported document kind');
    }

    return doc;
}