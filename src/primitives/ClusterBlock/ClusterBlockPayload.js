import { sha256 } from '@scintilla-network/hashes/classic';
import { uint8array, varint, json } from '@scintilla-network/keys/utils';

export class ClusterBlockPayload {
    constructor(props = {}) {
        this.hashProofHashes = props.hashProofHashes || [];
        this.orderedStateActions = props.orderedStateActions || [];
    }

    consider(key) {
        if (!key || typeof key !== 'string') {
            console.error('BlockData tried to consider without a proper key element.');
            return;
        }

        const [timestamp, hashProofHash, keyHashProofIndex] = key.split(':');

        // Logic for ordering and considering state actions
        const insertIndex = this.orderedStateActions.findIndex((element) => {
            const [timestampElement] = element.split(':');
            return timestampElement > timestamp;
        });

        if (!this.hashProofHashes.includes(hashProofHash)) {
            this.hashProofHashes.push(hashProofHash);
        }

        const hashProofIndex = this.hashProofHashes.findIndex((element) => element === hashProofHash);
        if (hashProofIndex === -1) {
            throw new Error(`HashProofHash ${hashProofHash} not found`);
        }

        const actionKey = `${hashProofIndex}:${keyHashProofIndex}`;
        if (insertIndex === -1) {
            this.orderedStateActions.push(actionKey);
        } else {
            this.orderedStateActions.splice(insertIndex, 0, actionKey);
        }
    }

    toUint8Array() {
        const hashProofHashesUint8Array = uint8array.fromString(JSON.stringify(this.hashProofHashes));
        const orderedStateActionsUint8Array = uint8array.fromString(JSON.stringify(this.orderedStateActions));

        const varintHashProofHashesLength = varint.encodeVarInt(hashProofHashesUint8Array.length);
        const varintOrderedStateActionsLength = varint.encodeVarInt(orderedStateActionsUint8Array.length);

        const totalLength = varintHashProofHashesLength.length + hashProofHashesUint8Array.length + varintOrderedStateActionsLength.length + orderedStateActionsUint8Array.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        result.set(varintHashProofHashesLength, offset); offset += varintHashProofHashesLength.length;
        result.set(hashProofHashesUint8Array, offset); offset += hashProofHashesUint8Array.length;
        result.set(varintOrderedStateActionsLength, offset); offset += varintOrderedStateActionsLength.length;
        result.set(orderedStateActionsUint8Array, offset);
        
        return result;
    }

    toHash(encoding = 'uint8array') {
        const uint8Array = this.toUint8Array();
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    static fromUint8Array(uint8Array) {
        let offset = 0;

        const { value: hashProofHashesLength, length: varintHashProofHashesLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += varintHashProofHashesLength;
        const hashProofHashesUint8Array = uint8Array.slice(offset, offset + Number(hashProofHashesLength));
        const hashProofHashes = json.parse(uint8array.toString(hashProofHashesUint8Array));
        offset += Number(hashProofHashesLength);

        const { value: orderedStateActionsLength, length: varintOrderedStateActionsLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += varintOrderedStateActionsLength;
        const orderedStateActionsUint8Array = uint8Array.slice(offset, offset + Number(orderedStateActionsLength));
        const orderedStateActions = json.parse(uint8array.toString(orderedStateActionsUint8Array));

        return new ClusterBlockPayload({
            hashProofHashes,
            orderedStateActions,
        });
    }

    toJSON() {
        return {
            hashProofHashes: this.hashProofHashes,
            orderedStateActions: this.orderedStateActions,
        };
    }
}

