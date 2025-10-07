import { SignableMessage, utils } from "@scintilla-network/keys";
const { uint8array } = utils;

/**
 * Verifies the signatures of the authorizations
 * @param element - The element to verify
 * @param authorizations - The authorizations to verify
 * @param hash - The hash to verify
 * @returns {boolean} - True if the signatures are valid
 */
function verifySignatures(element, authorizations, hash) {
    // get first signature from authorizations
    const valid = authorizations.every((authorization) => {
        const signature = authorization.signature;
        if (!signature) {
            throw new Error('Signature is required for verification.');
        }
        const publicKey = authorization.publicKey;
        const hexMessage = element?.toHex({ excludeAuthorizations: true }) ?? element;
        const hashMessage = hash ?? element?.toHash('hex', {excludeAuthorizations: true}) ?? element;

        const verifyElement = hexMessage.length > 8192 ? hashMessage : hexMessage;
        const signingMessage = SignableMessage.fromHex(verifyElement);

        let sigArray = signature;
        let pubKeyArray = publicKey;
        if(typeof signature === 'string'){
            sigArray = uint8array.fromHex(signature);
        }
        if(typeof publicKey === 'string'){
            pubKeyArray = uint8array.fromHex(publicKey);
        }
        return signingMessage.verify(sigArray, pubKeyArray ?? '');
    });
    if(!valid){
        // console.log('Invalid signatures for ', element.toHex({excludeAuthorizations: true}));
        console.log('Invalid signatures for ', element.toHash('hex', {excludeAuthorizations: true}), element.toJSON());
        // throw new Error('Invalid signatures for ' + element.toJSON());
        return false;
    }
    return valid;
}


/**
 * Verifies the signatures of the authorizations
 * @param doc - The document to verify
 * @param hash - The hash to verify
 * @returns {boolean} - True if the signatures are valid
 */
export default function verifyDoc(doc, hash){
    let verified = false
    if(doc.authorizations){
        verified = verifySignatures(doc, doc.authorizations, hash);
    } else if(doc.signatures){
        verified = verifySignatures(doc, doc.signatures, hash);
    }

    return verified;
}
