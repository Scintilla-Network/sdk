import { SignableMessage } from "@scintilla-network/keys";
import { NetMessage } from "../primitives/messages/NetMessage/NetMessage.js";
import { Authorization } from "../primitives/Authorization/Authorization.js";

// interface IAuthorization {
//     signature: string;
//     publicKey: string;
//     moniker?: string;
//     address?: string;
// }

/**
 * Checks if the element has already signed with the public key
 * @param element - The element to check
 * @param publicKey - The public key to check
 * @returns {boolean} - True if the element has already signed with the public key
 */
function checkHasAlreadySigned(element, publicKey){
    // Check either authorizations or signatures
    if(element.authorizations){
        const find = !!element.authorizations.find((authorization)  => authorization.publicKey === publicKey.toString());
        return find;
    }
    if(element.signatures){ 
        const find = !!element.signatures.find((signature)  => signature.publicKey === publicKey.toString());
        return find;
    }
    return false;
}

/**
 * Signs a document
 * @param doc - The document to sign
 * @param hash - The hash to sign
 * @param _options - The options for signing
 * @returns {Object} - The signed document
 */
export default function signDoc(doc, hash, _options = {}){
    const {element, current, previous, options} = doc;

    const isDocument = element && element.toHex;
    if(!isDocument){
        throw new Error('Document is not a valid document');
    }
    const hashMessage = (hash !== undefined) ? hash : element.toHash('hex', {excludeSignatures: true, excludeAuthorization: true});
    // const hashMessage = hash ?? element.toHash('hex', {excludeSignatures: true, excludeAuthorization: true});
    const hexMessage = element.toHex({excludeSignatures: true, excludeAuthorization: true});
    const signingElement = hexMessage.length > 8192 ? hashMessage : hexMessage;
    const signingMessage = SignableMessage.fromHex(signingElement);

    const hasAlreadySigned = checkHasAlreadySigned(element, current.signer.getPublicKey());
    if(hasAlreadySigned){
        // remove prior signature
        if(element.authorizations && element.authorizations.length === 1){
            element.authorizations = [];
        }
        if(element.signatures && element.signatures.length === 1){
            element.signatures = [];
        }
    }

    const [signature, publicKey] = signingMessage.sign(previous.signer);
    const address = current.signer.toAddress();
    // If the document has a .authorizations property, add the signature to the first authorization
    // Except if turned off
    if(options.addSignatureToAuthorization){
        // if(element.authorizations){
        //     const authorization = {
        //         signature: signature,
        //         publicKey: publicKey,
        //         address,
        //     }
        //     if(current.moniker){
        //         authorization.moniker = current.moniker;
        //     }
        //     element.authorizations.push(authorization);
        // } else if(element.signatures){
        //     const sig = {
        //         signature: signature,
        //         publicKey: publicKey,
        //         address,
        //     }
        //     if(current.moniker){
        //         sig.moniker = current.moniker;
        //     }
        //     element.signatures.push(sig);
        // } else {
        //     console.warn('No authorizations found in document, skipping signature addition');
        // }

        const authorization = new Authorization({
            signature,
            publicKey,
            address,
            moniker: current.moniker,
        });
        element.authorizations.addAuthorization(authorization);
    }

    function toNetMessage(){
        return new NetMessage({
            payload: element.toBuffer(),
            kind: element.kind,
            cluster: element.cluster,
            version: 1,
        });
    }

    return {
        element,
        current:{
            ...current,
            signatures:[{
                signature,
                publicKey,
            }],
        },
        previous,
        options,
        toNetMessage
    };
}
