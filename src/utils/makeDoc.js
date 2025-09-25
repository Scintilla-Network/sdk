import { ExtendedPrivateKey, Signer } from '@scintilla-network/keys';

/** 
 * Makes a document for signing.
 * @param {any} element - The element to make a document for.
 * @param {Signer} signingSigner - The signing signer.
 * @param {Object} _options - The options for making the document.
 * @param {number} _options.nonce - The nonce.
 * @param {number} _options.previousNonce - The previous nonce.
 * @param {boolean} _options.addSignatureToAuthorization - Whether to add the signature to the authorization.
 * @returns {Object} The made document.
 */
export default function makeDoc(element, signingSigner, _options = { nonce: 0, previousNonce: 0, addSignatureToAuthorization: true }){//} | undefined, chainId: string){
    if(!signingSigner){
        throw new Error('Public key is required for document making.');
    }
    // if(data.toUInt8Array){
    //     data = data.toUInt8Array({excludeAuthorization: false, excludeSignatures: false});
    // }
    // let key = signingSigner.getPublicKey().toHexString();
    const privateKey = ExtendedPrivateKey.fromSeed(signingSigner.privateKey);   

    let childKey;
    // We provide this key public info (from prior nonce), and use next nonce to derive new pubKeyHash.
    let previousKey;

    if(_options.nonce > 0 && privateKey.deriveChild){
        childKey = privateKey.deriveChild(_options.nonce);
        if(_options.previousNonce !== undefined && _options.previousNonce !== 0){
            previousKey = privateKey.deriveChild(_options.previousNonce);
        } else {
            if(_options.nonce !== 0){
                console.warn(`No previous nonce provided, using current nonce - 1 as previous nonce: {nonce: ${_options.nonce}, previousNonce: ${_options.nonce - 1}}`);
                previousKey = privateKey.deriveChild(_options.nonce - 1);
            } else {
                previousKey = privateKey;
            }
        }
    } else {
        childKey = privateKey;
        previousKey = privateKey;
    }

    const childSigner = new Signer(childKey);

    const options = {
        nonce: {
            previous: _options.previousNonce ?? (_options.nonce !== 0 ? _options.nonce - 1 : 0),
            current: _options.nonce,
        },
        addSignatureToAuthorization: _options.addSignatureToAuthorization ?? true,
    }

    const previousSigner = new Signer(previousKey);
    const madeDoc = {
        element: element,
        current:{
            signer: new Signer(childKey),
            publicKey: childKey.getPublicKey().toHexString(),
            pubKeyHashAddress: childSigner.toAddress(),
            moniker: childSigner.getMoniker() ?? signingSigner.getMoniker(),
        },
        previous:{
            signer: previousSigner,
            publicKey: previousKey.getPublicKey().toHexString(),
            pubKeyHashAddress: previousSigner.toAddress(),
            moniker: previousSigner.getMoniker(),
        },
        options,
    }

    // expect publicKey to be a hex string, throw error if not
    // if(typeof publicKey !== 'string'){
    //     throw new Error(`Public key must be a hex string. Received: ${typeof publicKey} - ${JSON.stringify(publicKey)}`);
    // }

    // const pubkeyBuffer = Buffer.from(publicKey, 'hex')
    // const pubkeyhash = ripemd160(sha256(pubkeyBuffer));
    // // @ts-ignore
    // const signerPubKeyHash =  bech32.encode('sct', bech32.toWords(pubkeyhash)) // sct....

    // const madeDoc =  {
    //     // "chain_id": chainId,
    //     "signer": signerPubKeyHash,
    //     "data": data,
    // }


    return madeDoc;
}
