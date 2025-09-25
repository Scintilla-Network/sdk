// src/messages/NetMessage.js
import { NET_KINDS } from "./NET_KINDS.js";
import { sha256 } from "@scintilla-network/hashes/classic";
import { CHAIN_SCINTILLA_1_MAGIC } from "../../../CONSTANTS.js";
// import { utils } from '@scintilla-network/keys';
import { uint8array, varint } from '@scintilla-network/keys/utils';
const { decodeVarInt, encodeVarInt } = varint;

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

    constructor(props = {}) {
        this.chain = props.chain || CHAIN_SCINTILLA_1_MAGIC;

        if (!(this.chain instanceof Uint8Array)) {
            throw new Error("Chain magic number must be a Uint8Array");
        }

        this.kind = props.kind || 'UNKNOWN';

        if (!Object.keys(NET_KINDS).includes(this.kind)) {
            this.kind = 'UNKNOWN';
        }

        this.cluster = props.cluster || 'unknown';

        this.payload = null;
        this.length = 0;
        this.setPayload(props.payload || null);
        this.version = props.version || 1;
    }

    setPayload(payload) {
        if (payload && !(payload instanceof Uint8Array)) {
            throw new Error("Payload must be a Uint8Array");
        }
        this.payload = payload;
        this.length = estimateLength(this.payload || new Uint8Array(0));
    }

    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return NetMessage.fromUint8Array(uint8Array);
    }

    toUint8Array() {
        const chainMagicNumberUint8Array = this.chain;

        const versionUint8Array = encodeVarInt(this.version, 'uint8array');   

        const kindValue = NET_KINDS[this.kind] || NET_KINDS.UNKNOWN;
        const kindUint8Array = encodeVarInt(kindValue, 'uint8array');

        const clusterUint8Array = uint8array.fromString(this.cluster);
        const clusterLengthUint8Array = encodeVarInt(clusterUint8Array.length, 'uint8array');

        const payloadUint8Array = this.payload || new Uint8Array(0);
        const checksumUint8Array = _computeChecksum(payloadUint8Array);

        const payloadLengthUint8Array = encodeVarInt(payloadUint8Array.length, 'uint8array');

        const totalLength = chainMagicNumberUint8Array.length + versionUint8Array.length + kindUint8Array.length + clusterLengthUint8Array.length + clusterUint8Array.length + checksumUint8Array.length + payloadLengthUint8Array.length + payloadUint8Array.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        result.set(chainMagicNumberUint8Array, offset); offset += chainMagicNumberUint8Array.length;
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(kindUint8Array, offset); offset += kindUint8Array.length;
        result.set(clusterLengthUint8Array, offset); offset += clusterLengthUint8Array.length;
        result.set(clusterUint8Array, offset); offset += clusterUint8Array.length;
        result.set(checksumUint8Array, offset); offset += checksumUint8Array.length;
        result.set(payloadLengthUint8Array, offset); offset += payloadLengthUint8Array.length;
        result.set(payloadUint8Array, offset);

        return result;
    }

    /**
     * @deprecated Use toUint8Array instead
     */
    toBuffer() {
        return this.toUint8Array();
    }

    static fromUint8Array(array) {
        let offset = 0;

        const chainMagic = array.slice(offset, offset + 4);
        offset += 4;

        const { value: version, length: versionLength } = decodeVarInt(array.slice(offset));
        offset += versionLength;

        const { value: kindValue, length: kindLength } = decodeVarInt(array.slice(offset));
        offset += kindLength;

        const { value: clusterLengthValue, length: clusterOffsetLength } = decodeVarInt(array.slice(offset));
        offset += clusterOffsetLength;

        const clusterUint8Array = array.slice(offset, offset + Number(clusterLengthValue));
        const cluster = uint8array.toString(clusterUint8Array);
        offset += Number(clusterLengthValue);

        const checksumFromMessage = array.slice(offset, offset + 4);
        offset += 4;

        const { value: payloadLength, length: payloadOffsetLength } = decodeVarInt(array.slice(offset));
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
        return new NetMessage({
            version: version,
            chain: chainMagic,
            kind: kindString,
            payload,
            cluster
        }); 
    }

    /**
     * @deprecated Use fromUint8Array instead
     */
    static fromBuffer(array) {
        return this.fromUint8Array(array);
    }

    toHash() {
        const hash = sha256(this.toUint8Array());
        return uint8array.toHex(hash);
    }
}

export default NetMessage;

