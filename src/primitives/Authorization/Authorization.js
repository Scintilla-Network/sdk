import { sha256 } from '@scintilla-network/hashes/classic';
import { SignableMessage } from '@scintilla-network/keys';
import { llog } from '../../utils/llog.js';
import { uint8array, varint, json } from '@scintilla-network/keys/utils';

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

        this.signature = signature || null;
        if(typeof signature === 'Uint8Array') {
            this.signature = uint8array.toHex(signature);
        }
        this.publicKey = publicKey || null;
        if(typeof publicKey === 'Uint8Array') {
            this.publicKey = uint8array.toHex(publicKey);
        }
        this.moniker = moniker || null;
        this.address = address || null;
    }

    /**
     * Create Authorization from hex string
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return Authorization.fromUint8Array(uint8Array);
    }
    
    /**
     * Create Authorization from JSON
     */
    static fromJSON(json) {
        llog.log(`- Authorization fromJSON`);
        return new Authorization({
            signature: json?.signature,
            publicKey: json?.publicKey,
            moniker: json?.moniker,
            address: json?.address
        });
    }


     /**
     * Create Authorization from Uint8Array
     */
     static fromUint8Array(inputArray) {
        llog.log(`---- Authorization.fromUint8Array (inputArray: ${uint8array.toHex(inputArray)})`);
        let offset = 0;

        const authType = varint.decodeVarInt(inputArray.subarray(offset));
        const authTypeBytes = inputArray.subarray(offset, offset + authType.length);
        offset += authType.length;

        llog.log(`----- Authorization.fromUint8Array. authType: ${uint8array.toHex(authTypeBytes)}`);

        const { value: authBytesLengthValue, length: authBytesLengthBytesLength } = varint.decodeVarInt(inputArray.subarray(offset));
        offset += authBytesLengthBytesLength;
        const authBytes = inputArray.subarray(offset, offset + authBytesLengthValue);

        let signature = null;
        let publicKey = null;
        let moniker = null;
        let address = null;
    

        llog.log(`----- Authorization.fromUint8Array. authBytes: ${uint8array.toHex(authBytes)}`);
        // Read signature if present
        offset = 0;
        if (authType.value & 1) {
            const { value: sigLengthValue, length: sigLengthBytesLength } = varint.decodeVarInt(authBytes.subarray(offset));
            offset += sigLengthBytesLength;
            
            const signatureSectionBytes = authBytes.subarray(offset, offset + sigLengthValue);
            signature = uint8array.toHex(signatureSectionBytes);
            offset += sigLengthValue;
        }
        llog.log(`----- Authorization.fromUint8Array. signature: ${signature}`);
        llog.log(signature);

        // Read publicKey if present
        if (authType.value & 2) {
            const { value: pubKeyLengthValue, length: pubKeyLengthBytesLength } = varint.decodeVarInt(authBytes.subarray(offset));
            offset += pubKeyLengthBytesLength;
            const pubKeySectionBytes = authBytes.subarray(offset, offset + pubKeyLengthValue);
            publicKey = uint8array.toHex(pubKeySectionBytes);
            offset += pubKeyLengthValue;
        }
        llog.log(`----- Authorization.fromUint8Array. publicKey: ${publicKey}`);
        llog.log(publicKey);

        // Read moniker if present
        if (authType.value & 4) {
            const { value: monikerLengthValue, length: monikerLengthBytesLength } = varint.decodeVarInt(authBytes.subarray(offset));
            offset += monikerLengthBytesLength;
            const monikerSectionBytes = authBytes.subarray(offset, offset + monikerLengthValue);
            llog.log(`----- Authorization.fromUint8Array. monikerBytes: ${uint8array.toHex(monikerSectionBytes)}`);
            moniker = uint8array.toString(monikerSectionBytes);
            offset += monikerLengthValue;
        }
        llog.log(`----- Authorization.fromUint8Array. moniker: ${moniker}`);
        llog.log(moniker);

        // Read address if present
        if (authType.value & 8) {
            const { value: addressLengthValue, length: addressLengthBytesLength } = varint.decodeVarInt(authBytes.subarray(offset));
            offset += addressLengthBytesLength;
            const addressSectionBytes = authBytes.subarray(offset, offset + addressLengthValue);
            address = uint8array.toString(addressSectionBytes);
            offset += addressLengthValue;
        }
        llog.log(`----- Authorization.fromUint8Array. address: ${address}`);
        llog.log(address);

        return new Authorization({
            signature,
            publicKey,
            moniker,
            address
        });
    }

    /**
     * Verify the authorization
     * @param {Object} element - The element to verify
     * @returns {Object} - The verification result
     */
    verify(element) {
        const valid = this.verifySignatures(element, this.publicKey);
        if(!valid || valid.valid === false) {
            return {valid: false, error: 'Invalid signature.'};
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
            const signatureBytes = uint8array.fromHex(this.signature);
            const signatureLength = varint.encodeVarInt(signatureBytes.length);
            const signatureSectionBytes = new Uint8Array([...signatureLength, ...signatureBytes]);
            authBytes = new Uint8Array([...authBytes, ...signatureSectionBytes]);
        }

        // Add publicKey if present
        if (authType & 2) {
            const pubKeyBytes = uint8array.fromHex(this.publicKey ?? null)
            const pubKeyLength = varint.encodeVarInt(pubKeyBytes.length);
            const pubKeySectionBytes = new Uint8Array([...pubKeyLength, ...pubKeyBytes]);
            authBytes = new Uint8Array([...authBytes, ...pubKeySectionBytes]);
        }

        // Add moniker if present
        if (authType & 4) {
            const monikerBytes = uint8array.fromString(this.moniker ?? '');
            const monikerLength = varint.encodeVarInt(monikerBytes.length);
            const monikerSectionBytes = new Uint8Array([...monikerLength, ...monikerBytes]);
            authBytes = new Uint8Array([...authBytes, ...monikerSectionBytes]);
        }

        // Add address if present
        if (authType & 8) {
            const addressBytes = uint8array.fromString(this.address ?? '');
            const addressLength = varint.encodeVarInt(addressBytes.length);
            const addressSectionBytes = new Uint8Array([...addressLength, ...addressBytes]);
            authBytes = new Uint8Array([...authBytes, ...addressSectionBytes]);
        }

        const authBytesLength = varint.encodeVarInt(authBytes.length);
        const authTypeBytes = varint.encodeVarInt(authType);

        const totalLength = authTypeBytes.length + authBytesLength.length + authBytes.length;
        llog.log(`---- Authorization.toUint8Array.(totalLength: ${totalLength})`);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        llog.log(`---- Authorization.toUint8Array.(result appended authTypeBytes: ${uint8array.toHex(result)} + ${uint8array.toHex(authTypeBytes)}) (authType: ${authType})`);
        result.set(authTypeBytes, 0);offset += authTypeBytes.length;
        llog.log(`---- Authorization.toUint8Array.(result appended authBytesLength: ${uint8array.toHex(result)} + ${uint8array.toHex(authBytesLength)}) (authBytesLength: ${authBytesLength})`);
        result.set(authBytesLength, offset);offset += authBytesLength.length;
        llog.log(`---- Authorization.toUint8Array.(result appended authBytes: ${uint8array.toHex(result)} + ${uint8array.toHex(authBytes)}) (authBytes: ${authBytes})`);
        result.set(authBytes, offset);offset += authBytes.length;
        llog.log(`--- Authorization.toUint8Array.(result: ${uint8array.toHex(result)})`);
        return result;
    }

    /**
     * Convert to JSON representation
     */
    toJSON() {
        return {
            signature: this.signature ? this.signature : null,
            publicKey: this.publicKey ? this.publicKey : null,
            moniker: this.moniker,
            address: this.address
        };
    }

   
    /**
     * Compute hash of the authorization
     */
    toHash(encoding = 'hex') {
        const jsonData = this.toJSON();
        const stringified = json.sortedJsonByKeyStringify(jsonData);
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

    verifySignatures(element, publicKey) {
        if(!this.signature) return {valid: false, error: 'Signature is required for verification.'};
        if(!this.publicKey && !publicKey) return {valid: false, error: 'Public key is required for verification.'};

        const signingMessage = this.getSignedBytes(element);

        const valid = signingMessage.verify(uint8array.fromHex(this.signature), uint8array.fromHex(this.publicKey ?? publicKey));
        if(!valid) {
            return {valid: false, error: 'Invalid signature.'};
        }
        return {valid: true, error: ''};
    }

    getSignedBytes(element) {
        const isDocument = element && element.toHex;
        if(!isDocument){
            throw new Error('Document is not a valid document');
        }
        const hexMessage = element.toHex({excludeAuthorizations: true});
        const shouldSignHash = hexMessage.length > 8192;
        if(shouldSignHash){
            const hashMessage = element.toHash('hex', {excludeAuthorizations: true});
            return SignableMessage.fromHex(hashMessage);
        }

        return SignableMessage.fromHex(hexMessage);
    }


    async sign(element, signer) {
        const isDocument = element && element.toHex;
        if(!isDocument){
            throw new Error('Document is not a valid document');
        }
        try {
            const signingMessage = this.getSignedBytes(element);
            const [signature, publicKey] = signingMessage.sign(signer);
            this.signature = uint8array.toHex(signature);
            llog.log(`Authorization Signature: ${this.signature}`);
            this.publicKey = uint8array.toHex(publicKey);
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

    static fromAuthorizationsUint8Array(inputArray) {
        const authorizations = [];
        let offset = 0;
        const {value: authAmount, length: authAmountBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        llog.log(`- Authorizations fromAuthorizationsUint8Array. authAmount: ${authAmount}`);
        if(authAmount === 0) {
            return authorizations;
        }
        offset += authAmountBytes;
        const {value: authLength, length: authLengthBytesLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += authLengthBytesLength;
        for(let i = 0; i < authAmount; i++) {
            const authLengthBytes = inputArray.subarray(offset, offset + authLength);
            const authorization = Authorization.fromUint8Array(authLengthBytes);
            authorizations.push(authorization);
            offset += authorization.toUint8Array().length;
        }
        llog.log(`- Authorizations fromAuthorizationsUint8Array. authorizations: ${authorizations}`);
        return authorizations;
    }

    static fromAuthorizationsJSON(json) {
        return (json.authorizations?.length > 0) ? json.authorizations.map(auth => Authorization.fromJSON(auth)) : [];
    }
    
    static toAuthorizationsJSON(authorizations) {
        return authorizations.map(auth => auth.toJSON());
    }

    static toAuthorizationsUint8Array(authorizations) {
        llog.log(`- Authorizations toAuthorizationsUint8Array`);
        llog.log(authorizations);
        const authAmountBytes = varint.encodeVarInt(authorizations.length, 'uint8array');
        let authBytes = new Uint8Array(0);

        for(let i = 0; i < authorizations.length; i++) {
            let authorization = null;
            if(authorizations[i] instanceof Authorization){
                authorization = authorizations[i];
            }else {
                authorization = new Authorization(authorizations[i]);
            }

            const auth = authorization.toUint8Array();
            authBytes = new Uint8Array([...authBytes, ...auth]);
        }

        const authBytesLength = varint.encodeVarInt(authBytes.length, 'uint8array');
        const totalLength = authAmountBytes.length + authBytesLength.length + authBytes.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        result.set(authAmountBytes, 0);offset += authAmountBytes.length;
        result.set(authBytesLength, offset);offset += authBytesLength.length;
        result.set(authBytes, offset);offset += authBytes.length;
        return result;
    }
}

export default Authorization;
