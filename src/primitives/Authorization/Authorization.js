import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
import { utils, SignableMessage } from '@scintilla-network/keys';
const { uint8array, varint, json } = utils;
const { encodeVarInt, decodeVarInt } = varint;
const { sortedJsonByKeyStringify } = json;

/**
 * Authorization class for handling cryptographic authorization data
 * Used across various primitives like ClusterBlock, Voucher, Transaction, Transfer, and Transition
 */
export class Authorization {
    constructor({
        signature = null,
        publicKey = null,
        moniker = null,
        address = null
    } = {}) {
        // Convert string signatures/publicKeys to Uint8Array
        this.signature = this._processSignature(signature);
        this.publicKey = this._processPublicKey(publicKey);
        this.moniker = moniker || null;
        this.address = address || null;
    }



    verify(element) {
        const valid = this.verifySignatures(element, this.publicKey);
        if(!valid || valid.valid === false) {
            throw new Error('Invalid signature.');
        }
        return valid;
    }

    /**
     * Process signature input - convert string to Uint8Array if needed
     * @private
     */
    _processSignature(signature) {
        if (!signature) return null;
        if (typeof signature === 'string') {
            return signature === '' ? null : uint8array.fromHex(signature);
        }
        if (signature instanceof Uint8Array) {
            return signature.length === 0 ? null : signature;
        }
        return null;
    }

    /**
     * Process publicKey input - convert string to Uint8Array if needed
     * @private
     */
    _processPublicKey(publicKey) {
        if (!publicKey) return null;
        if (typeof publicKey === 'string') {
            return publicKey === '' ? null : uint8array.fromHex(publicKey);
        }
        if (publicKey instanceof Uint8Array) {
            return publicKey.length === 0 ? null : publicKey;
        }
        return null;
    }

    /**
     * Convert Authorization to Uint8Array using the bit-flag encoding pattern from Voucher
     */
    toUint8Array() {
        const chunks = [];
        
        // Authorization type (bit flags: 1=signature, 2=publicKey, 4=moniker, 8=address)
        let authType = 0;
        if (this.signature) authType |= 1;
        if (this.publicKey) authType |= 2;
        if (this.moniker) authType |= 4;
        if (this.address) authType |= 8;

        // chunks.push(new Uint8Array([authType]));
        let authBytes = new Uint8Array();

        // Add signature if present
        if (authType & 1) {
            const signatureLength = encodeVarInt(this.signature.length);
            authBytes = new Uint8Array([...authBytes, ...signatureLength, ...this.signature]);
        }

        // Add publicKey if present
        if (authType & 2) {
            const pubKey = this.publicKey ?? new Uint8Array();
            const pubKeyLength = encodeVarInt(pubKey.length);
            authBytes = new Uint8Array([...authBytes, ...pubKeyLength, ...pubKey]);
        }

        // Add moniker if present
        if (authType & 4) {
            const monikerBytes = uint8array.fromString(this.moniker ?? '');
            const monikerLength = encodeVarInt(monikerBytes.length);
            authBytes = new Uint8Array([...authBytes, ...monikerLength, ...monikerBytes]);
        }

        // Add address if present
        if (authType & 8) {
            const addressBytes = uint8array.fromString(this.address ?? '');
            const addressLength = encodeVarInt(addressBytes.length);
            authBytes = new Uint8Array([...authBytes, ...addressLength, ...addressBytes]);
        }

        // let authBytes = new Uint8Array();
        // for(const chunk of chunks) {
        //     authBytes = new Uint8Array([...authBytes, ...chunk]);
        // }
        const authBytesLength = encodeVarInt(authBytes.length);
        const authTypeBytes = encodeVarInt(authType);
        // process.exit(0);


        // const totalLength = authTypeBytesLength  authBytesLength;
        const totalLength = authTypeBytes.length + authBytesLength.length + authBytes.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        result.set(authTypeBytes, 0);offset += authTypeBytes.length;
        result.set(authBytesLength, offset);offset += authBytesLength.length;
        result.set(authBytes, offset);offset += authBytes.length;
        // process.exit(0);
        return result;
    }

    /**
     * Create Authorization from Uint8Array
     */
    static fromUint8Array(inputArray) {
        let offset = 0;


        const authType = decodeVarInt(inputArray.subarray(offset));
        offset += authType.length;

        const authBytesLength = decodeVarInt(inputArray.subarray(offset));
        offset += authBytesLength.length;


        const authBytes = inputArray.subarray(offset, offset + authBytesLength.value);


        let signature = null;
        let publicKey = null;
        let moniker = null;
        let address = null;

        // Read signature if present
        offset = 0;
        if (authType.value & 1) {
            const { value: sigLength, length: sigLengthBytes } = decodeVarInt(authBytes.subarray(offset));
            offset += sigLengthBytes;
            signature = authBytes.subarray(offset, offset + sigLength);
            offset += sigLength;
        }

        // Read publicKey if present
        if (authType.value & 2) {
            const { value: pubKeyLength, length: pubKeyLengthBytes } = decodeVarInt(authBytes.subarray(offset));
            offset += pubKeyLengthBytes;
            publicKey = authBytes.subarray(offset, offset + pubKeyLength);
            offset += pubKeyLength;
        }

        // Read moniker if present
        if (authType.value & 4) {
            const { value: monikerLength, length: monikerLengthBytes } = decodeVarInt(authBytes.subarray(offset));
            offset += monikerLengthBytes;
            moniker = uint8array.toString(authBytes.subarray(offset, offset + monikerLength));
            offset += monikerLength;
        }

        // Read address if present
        if (authType.value & 8) {
            const { value: addressLength, length: addressLengthBytes } = decodeVarInt(authBytes.subarray(offset));
            offset += addressLengthBytes;
            address = uint8array.toString(authBytes.subarray(offset, offset + addressLength));
            offset += addressLength;
        }

        return new Authorization({
            signature,
            publicKey,
            moniker,
            address
        });
    }

    /**
     * Convert to JSON representation
     */
    toJSON() {
        return {
            signature: this.signature ? uint8array.toHex(this.signature) : null,
            publicKey: this.publicKey ? uint8array.toHex(this.publicKey) : null,
            moniker: this.moniker,
            address: this.address
        };
    }

    /**
     * Create Authorization from JSON
     */
    static fromJSON(json) {
        return new Authorization({
            signature: json.signature,
            publicKey: json.publicKey,
            moniker: json.moniker,
            address: json.address
        });
    }

    /**
     * Compute hash of the authorization
     */
    toHash(encoding = 'hex') {
        const jsonData = this.toJSON();
        const stringified = sortedJsonByKeyStringify(jsonData);
        const dataUint8Array = uint8array.fromString(stringified);
        const hash = sha256(dataUint8Array);
        
        return encoding === 'hex' ? uint8array.toHex(hash) : hash;
    }

    /**
     * Convert to hex string
     */
    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    /**
     * Create Authorization from hex string
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return Authorization.fromUint8Array(uint8Array);
    }

    verifySignatures(element, publicKey) {
        if(!this.signature) return {valid: false, error: 'Signature is required for verification.'};
        if(!this.publicKey && !publicKey) return {valid: false, error: 'Public key is required for verification.'};

        let elementBytes = element?.toUint8Array({ excludeSignatures: true, excludeAuthorizations: true });
        if(!elementBytes) {
            elementBytes=element?.toHex({ excludeSignatures: true, excludeAuthorizations: true });
        }
        if(!elementBytes) {
            elementBytes=element?.toHash('hex', {excludeSignatures: true, excludeAuthorizations: true });
        }
        if(!elementBytes) {
            return {valid: false, error: 'Element bytes are required for verification.'};
        }
        // const elementBytesUint8Array = uint8array.fromHex(elementBytes);
        const signingMessage = new SignableMessage(elementBytes);
        const valid = signingMessage.verify(this.signature, this.publicKey ?? publicKey);
        if(!valid) {
            return {valid: false, error: 'Invalid signature.'};
        }
        return {valid: true, error: ''};
    }


    async sign(element, signer) {
        const isDocument = element && element.toHex;
        if(!isDocument){
            throw new Error('Document is not a valid document');
        }
        try {
            const hashMessage = element.toHash('hex', {excludeSignatures: true, excludeAuthorizations: true});
            const hexMessage = element.toHex({excludeSignatures: true, excludeAuthorizations: true});
            const signingElement = hexMessage.length > 8192 ? hashMessage : hexMessage;
            const signingMessage = SignableMessage.fromHex(signingElement);
            const [signature, publicKey] = signingMessage.sign(signer);
            this.signature = signature;
            this.publicKey = publicKey;
            this.moniker = signer.getMoniker();
            this.address = signer.toAddress();
        } catch (error) {
            throw error;
        }
        
        return this;
       
    }

    /**
     * Check if authorization has a signature
     */
    hasSignature() {
        return this.signature !== null && this.signature.length > 0;
    }

    /**
     * Check if authorization has a public key
     */
    hasPublicKey() {
        return this.publicKey !== null && this.publicKey.length > 0;
    }

    /**
     * Check if authorization is valid (has at least signature)
     */
    isValid(element) {
        if(!element) {
            throw new Error('Element is required for verification.');
        }
        const hasSignature = this.hasSignature();
        
        if(!hasSignature) return false;
        const hasValidSignatures = this.verifySignatures(element, this.publicKey);
        if(!hasValidSignatures) return false;
        return true;
    }

    /**
     * Check if authorization is empty (no data)
     */
    isEmpty() {
        return !this.signature && !this.publicKey && !this.moniker && !this.address;
    }

    /**
     * Get authorization type flags
     */
    getTypeFlags() {
        let flags = 0;
        if (this.signature) flags |= 1;
        if (this.publicKey) flags |= 2;
        if (this.moniker) flags |= 4;
        if (this.address) flags |= 8;
        return flags;
    }

    /**
     * Clone the authorization
     */
    clone() {
        return new Authorization({
            signature: this.signature ? new Uint8Array(this.signature) : null,
            publicKey: this.publicKey ? new Uint8Array(this.publicKey) : null,
            moniker: this.moniker,
            address: this.address
        });
    }

    /**
     * Compare with another authorization
     */
    equals(other) {
        if (!(other instanceof Authorization)) return false;
        
        // Compare signatures
        if (this.signature && other.signature) {
            if (this.signature.length !== other.signature.length) return false;
            for (let i = 0; i < this.signature.length; i++) {
                if (this.signature[i] !== other.signature[i]) return false;
            }
        } else if (this.signature !== other.signature) {
            return false;
        }

        // Compare public keys
        if (this.publicKey && other.publicKey) {
            if (this.publicKey.length !== other.publicKey.length) return false;
            for (let i = 0; i < this.publicKey.length; i++) {
                if (this.publicKey[i] !== other.publicKey[i]) return false;
            }
        } else if (this.publicKey !== other.publicKey) {
            return false;
        }

        return this.moniker === other.moniker && this.address === other.address;
    }
}

export default Authorization;
