import { NET_KINDS } from "./NET_KINDS.js";
import { sha256 } from "@scintilla-network/hashes/classic";
import { CHAIN_SCINTILLA_1_MAGIC } from "../../../CONSTANTS.js";
import { uint8array, varint } from '@scintilla-network/keys/utils';
import { kindToConstructor } from "../../../utils/kindToConstructor.js";
import { SignableMessage } from "@scintilla-network/keys";

function estimateLength(payload) {
    return payload.length;
}

function _computeChecksum(payload) {
    if (!payload) {
        return new Uint8Array(4);
    }
    const hash = sha256(payload);
    return hash.slice(0, 4);
}

export class NetMessage {
    static NET_KINDS = NET_KINDS;

    /**
     * Create NetMessage
     * @param {Object} props - The properties
     * @param {Uint8Array} props.chain - The chain magic number
     * @param {string} props.kind - The kind
     * @param {number} props.version - The version
     * @param {string} props.cluster - The cluster
     * @param {Uint8Array} props.payload - The payload
     */
    constructor(props = {}) {
        /**
         * The chain magic number
         * @type {Uint8Array}
         */
        this.chain = props.chain || CHAIN_SCINTILLA_1_MAGIC;
        if (!(this.chain instanceof Uint8Array)) {
            throw new Error("Chain magic number must be a Uint8Array");
        }
        this.kind = props.kind || 'UNKNOWN';

        if (!Object.keys(NET_KINDS).includes(this.kind)) {
            this.kind = 'UNKNOWN';
        }

        this.version = props.version || 1;

        this.cluster = props.cluster || 'unknown';

        this.payload = null;
        this.length = 0;

        this.setPayload(props.payload || null);

        this.signature = props.signature || null;
    }

    /**
     * Create NetMessage from Uint8Array
     * @param {Uint8Array} array - The Uint8Array
     * @returns {NetMessage} The NetMessage instance
     */
    static fromUint8Array(array) {
        let offset = 0;

        const chainMagic = array.slice(offset, offset + 4);
        offset += 4;

        const { value: kindValue, length: kindLength } = varint.decodeVarInt(array.slice(offset));
        offset += kindLength;

        const { value: version, length: versionLength } = varint.decodeVarInt(array.slice(offset));
        offset += versionLength;

        const { value: clusterLengthValue, length: clusterOffsetLength } = varint.decodeVarInt(array.slice(offset));
        offset += clusterOffsetLength;

        const clusterUint8Array = array.slice(offset, offset + Number(clusterLengthValue));
        const cluster = uint8array.toString(clusterUint8Array);
        offset += Number(clusterLengthValue);

        const checksumFromMessage = array.slice(offset, offset + 4);
        offset += 4;

        const { value: payloadLength, length: payloadOffsetLength } = varint.decodeVarInt(array.slice(offset));
        offset += Number(payloadOffsetLength);

        if (array.length < offset + Number(payloadLength)) {
            throw new Error("Payload length is greater than the uint8Array length");
        }
        const payload = array.slice(offset, offset + Number(payloadLength));
        offset += Number(payloadLength);

        const calculatedChecksum = _computeChecksum(payload);
        // Compare arrays manually since Uint8Array doesn't have equals method
        let checksumMatch = calculatedChecksum.length === checksumFromMessage.length;
        if (checksumMatch) {
            for (let i = 0; i < calculatedChecksum.length; i++) {
                if (calculatedChecksum[i] !== checksumFromMessage[i]) {
                    checksumMatch = false;
                    break;
                }
            }
        }
        if (!checksumMatch) {
            throw new Error("Checksum mismatch! The payload might have been tampered with.");
        }

        const kindString = Object.keys(NET_KINDS).find(key => NET_KINDS[key] === kindValue) || 'UNKNOWN';

        const signature = array.slice(offset, offset + 64);
        offset += 64;

        return new NetMessage({
            version: version,
            chain: chainMagic,
            kind: kindString,
            payload,
            cluster,
            signature
        }); 
    }

    /**
     * Get the payload kind
     * @returns {string} The payload kind
     */
    getPayloadKind() {
        // Payload first bytes should be a kind, but might not always, then we "UNKNOWN" it. It might be misinterpreted as a kind too. 
        const kind = this.payload[0];
        const kindString = Object.keys(NET_KINDS).find(key => NET_KINDS[key] === kind) || 'UNKNOWN';
        return kindString;
    }

    /**
     * Convert to payload kind instance
     * @returns {Object} The payload kind instance
     */
    toPayloadKindInstance() {
        const payloadKind = this.getPayloadKind();
        const constructor = kindToConstructor(payloadKind);
        return constructor.fromUint8Array(this.payload);
    }

    /**
     * Create NetMessage from hex
     * @param {string} hex - The hex string
     * @returns {NetMessage} The NetMessage instance
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return NetMessage.fromUint8Array(uint8Array);
    }

    /**
     * Set the payload
     * @param {Uint8Array} payload - The payload
     */
    setPayload(payload) {
        if (payload && !(payload instanceof Uint8Array)) {
            throw new Error("Payload must be a Uint8Array");
        }
        this.payload = payload;
        this.length = estimateLength(this.payload || new Uint8Array(0));
    }

    /**
     * Sign the NetMessage
     * @param {Signer} signer - The signer
     * @returns {Uint8Array} The signature
     */
    async sign(signer) {
        try {
            const signingMessage = new SignableMessage(this.toUint8Array());
            const [signature] = signingMessage.sign(signer);
            this.signature = signature;
        } catch (error) {
            throw error;
        }
        return this.signature;
        
    }

    /**
     * Convert to hex
     * @param {boolean} excludeSignature - Whether to exclude the signature
     * @returns {string} The hex string
     */
    toHex(excludeSignature = false) {
        return uint8array.toHex(this.toUint8Array(excludeSignature));
    }

    /**
     * Convert to Uint8Array
     * @param {boolean} excludeSignature - Whether to exclude the signature
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array(excludeSignature = false) {
        const chainMagicNumberUint8Array = this.chain;

        const kindValue = NET_KINDS[this.kind] || NET_KINDS.UNKNOWN;
        const kindUint8Array = varint.encodeVarInt(kindValue, 'uint8array');

        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');   

        const clusterUint8Array = uint8array.fromString(this.cluster);
        const clusterLengthUint8Array = varint.encodeVarInt(clusterUint8Array.length, 'uint8array');

        const payloadUint8Array = this.payload || new Uint8Array(0);
        const checksumUint8Array = _computeChecksum(payloadUint8Array);

        const payloadLengthUint8Array = varint.encodeVarInt(payloadUint8Array.length, 'uint8array');

        const signatureUint8Array = excludeSignature ? new Uint8Array(0) : this.signature ? this.signature : new Uint8Array(0);

        const totalLength = chainMagicNumberUint8Array.length + versionUint8Array.length + kindUint8Array.length + clusterLengthUint8Array.length + clusterUint8Array.length + checksumUint8Array.length + payloadLengthUint8Array.length + payloadUint8Array.length + signatureUint8Array.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        result.set(chainMagicNumberUint8Array, offset); offset += chainMagicNumberUint8Array.length;
        result.set(kindUint8Array, offset); offset += kindUint8Array.length;
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(clusterLengthUint8Array, offset); offset += clusterLengthUint8Array.length;
        result.set(clusterUint8Array, offset); offset += clusterUint8Array.length;
        result.set(checksumUint8Array, offset); offset += checksumUint8Array.length;
        result.set(payloadLengthUint8Array, offset); offset += payloadLengthUint8Array.length;
        result.set(payloadUint8Array, offset); offset += payloadUint8Array.length;
        result.set(signatureUint8Array, offset); offset += signatureUint8Array.length;

        return result;
    }

    /**
     * Convert to hash
     * @param {string} encoding - The encoding
     * @returns {string} The hash
     */
    toHash(encoding = 'uint8array') {
        const uint8Array = this.toUint8Array();
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    /**
     * Verify the signature
     * @param {string} publicKey - The public key
     * @returns {boolean} True if the signature is valid
     */
    verifySignature(publicKey) {
        const signingMessage = new SignableMessage(this.toUint8Array(true));
        return signingMessage.verify(this.signature, publicKey);
    }
}

export default NetMessage;

