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

        chunks.push(new Uint8Array([authType]));

        // Add signature if present
        if (authType & 1) {
            const signatureLength = encodeVarInt(this.signature.length);
            chunks.push(signatureLength);
            chunks.push(this.signature);
        }

        // Add publicKey if present
        if (authType & 2) {
            const publicKeyLength = encodeVarInt(this.publicKey?.length ?? 0);
            chunks.push(publicKeyLength);
            chunks.push(this.publicKey ?? new Uint8Array());
        }

        // Add moniker if present
        if (authType & 4) {
            const monikerBytes = uint8array.fromString(this.moniker ?? '');
            const monikerLength = encodeVarInt(monikerBytes.length);
            chunks.push(monikerLength);
            chunks.push(monikerBytes);
        }

        // Add address if present
        if (authType & 8) {
            const addressBytes = uint8array.fromString(this.address ?? '');
            const addressLength = encodeVarInt(addressBytes.length);
            chunks.push(addressLength);
            chunks.push(addressBytes);
        }

        // Calculate total length and create result array
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        return result;
    }

    /**
     * Create Authorization from Uint8Array
     */
    static fromUint8Array(uint8Array) {
        let offset = 0;
        
        // Read authorization type
        const authType = uint8Array[offset];
        offset += 1;

        let signature = null;
        let publicKey = null;
        let moniker = null;
        let address = null;

        // Read signature if present
        if (authType & 1) {
            const { value: sigLength, length: sigLengthBytes } = decodeVarInt(uint8Array.subarray(offset));
            offset += sigLengthBytes;
            signature = uint8Array.subarray(offset, offset + sigLength);
            offset += sigLength;
        }

        // Read publicKey if present
        if (authType & 2) {
            const { value: pubKeyLength, length: pubKeyLengthBytes } = decodeVarInt(uint8Array.subarray(offset));
            offset += pubKeyLengthBytes;
            publicKey = uint8Array.subarray(offset, offset + pubKeyLength);
            offset += pubKeyLength;
        }

        // Read moniker if present
        if (authType & 4) {
            const { value: monikerLength, length: monikerLengthBytes } = decodeVarInt(uint8Array.subarray(offset));
            offset += monikerLengthBytes;
            moniker = uint8array.toString(uint8Array.subarray(offset, offset + monikerLength));
            offset += monikerLength;
        }

        // Read address if present
        if (authType & 8) {
            const { value: addressLength, length: addressLengthBytes } = decodeVarInt(uint8Array.subarray(offset));
            offset += addressLengthBytes;
            address = uint8array.toString(uint8Array.subarray(offset, offset + addressLength));
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

        let elementBytes = element?.toUint8Array({ excludeSignatures: true, excludeAuthorization: true });
        if(!elementBytes) {
            elementBytes=element?.toHex({ excludeSignatures: true, excludeAuthorization: true });
        }
        if(!elementBytes) {
            elementBytes=element?.toHash('hex', {excludeSignatures: true, excludeAuthorization: true });
        }
        if(!elementBytes) {
            return {valid: false, error: 'Element bytes are required for verification.'};
        }
        // const elementBytesUint8Array = uint8array.fromHex(elementBytes);
        const signingMessage = new SignableMessage(elementBytes);
        const valid = signingMessage.verify(this.signature, this.publicKey ?? publicKey);
        if(!valid) {
            console.log('Invalid signature.', this.toJSON());
            return {valid: false, error: 'Invalid signature.'};
        }
        return {valid: true, error: ''};
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
    isValid() {
        const hasSignature = this.hasSignature();
        if(!hasSignature) return false;
        const hasValidSignatures = this.verifySignatures();
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
