import { NetMessage } from "../primitives/messages/NetMessage/NetMessage.js";

/**
 * Export a document to a hex string
 * @param {Object} doc - The document to export
 * @returns {Object} The exported document
 */
export default function exportDoc(doc){
    const {element} = doc;

    const isDocument = element && element.toHex;
    if(!isDocument){
        throw new Error('Document is not a valid document');
    }
    const netMessage = new NetMessage({
        payload: element.toBuffer(),
        kind: element.kind,
        cluster: element.cluster,
        version: 1,
    });
    return {
        message: netMessage,
        element,
        hex: netMessage.toHex(),
    };
}
