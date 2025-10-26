import { serialize, deserialize } from '@scintilla-network/serialize';
import { uint8array, varint } from '@scintilla-network/keys/utils';
import { sha256 } from '@scintilla-network/hashes/classic';
import { MerkleTree } from "@scintilla-network/trees";

import { kindToConstructor } from '../../utils/kindToConstructor.js';


function loadActions(actions) {
    return actions.map(action => {
        try {
            if(action.kind && !action.fromJSON){
                const constructor = kindToConstructor(action.kind);
                return constructor.fromJSON(action);
            }
            return action;
        } catch (e) {
            console.error('Failed to parse action:', e, action);
            throw new Error(`Failed to parse action: ${e.message}`);
        }
    });
}

export class RelayBlockPayload {
    /**
     * Create RelayBlockPayload
     * @param {Object} options - The options
     * @param {Object[]} options.actions - The actions
     * @param {Object[]} options.clusters - The clusters
     */
    constructor(options = {}) {
        this.actions = loadActions(options.actions || []);
        this.clusters = options.clusters || [];
    }

    /**
     * Create RelayBlockPayload from JSON
     * @param {Object} json - The JSON object
     * @returns {RelayBlockPayload} The RelayBlockPayload instance
     */
    static fromJSON(json) {
        return new RelayBlockPayload({
            ...json,
        });
    }

    /**
     * Create RelayBlockPayload from Uint8Array
     * @param {Uint8Array} inputArray - The Uint8Array
     * @returns {RelayBlockPayload} The RelayBlockPayload instance
     */
    static fromUint8Array(inputArray) {
        const payloadProps = {};
        let offset = 0;

          // Actions
          const {value: actionsTotalLength, length: actionsTotalLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
          offset += actionsTotalLengthBytes;
          const actions = deserialize.toObject(inputArray.subarray(offset), kindToConstructor);
          payloadProps.actions = actions.value;
          offset += actionsTotalLength;
  
          // Clusters
          const {value: clustersTotalLength, length: clustersTotalLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
          offset += clustersTotalLengthBytes;
          const clusters = deserialize.toObject(inputArray.subarray(offset), kindToConstructor);
          payloadProps.clusters = clusters.value;
          offset += clustersTotalLength;

        return new RelayBlockPayload(payloadProps); 
    }

    /**
     * Hash a cluster
     * @param {Object} cluster - The cluster
     * @returns {Uint8Array} The hash
     */
    static hashCluster(cluster) {
        if (!Array.isArray(cluster) || cluster.length !== 2) {
            throw new Error('Invalid cluster format: expected [clusterName, clusterHash]');
        }
        const [clusterName, clusterHash] = cluster;
        // Serialize clusterName (string) and clusterHash (hex string) to Uint8Array
        const nameBytes = serialize.fromString(clusterName).value;
        const hashBytes = uint8array.fromHex(clusterHash);
        // Concatenate and hash
        const combined = new Uint8Array(nameBytes.length + hashBytes.length);
        combined.set(nameBytes, 0);
        combined.set(hashBytes, nameBytes.length);
        return sha256(combined);
    }

    /**
     * Generate a Merkle root
     * @param {Object[]} data - The data
     * @param {string} encoding - The encoding
     * @returns {Object} The Merkle root
     */
    static generateMerkleRoot(data, encoding = 'uint8array') {
        if (!data || data.length === 0) {
            return null;
        }
        const hashes = data.map((element) => element.toHash());
        const tree = new MerkleTree(hashes, 'sha256');
        const root = tree.root(encoding);
        return {root};
    }

    /**
     * Consider a state action
     * @param {Object} stateAction - The state action
     */
    considerStateAction(stateAction) {
        if (!stateAction) {
            console.error('RelayBlockPayload tried to consider an undefined state action.');
            return;
        }
        this.actions.push(stateAction);
    }

    /**
     * Consider a cluster
     * @param {string} clusterMoniker - The cluster moniker
     * @param {string} clusterHash - The cluster hash
     */
    considerCluster(clusterMoniker, clusterHash) {
        if (!clusterMoniker || !clusterHash) {
            console.error('RelayBlockPayload tried to consider an undefined cluster.');
            return;
        }

        this.clusters.push([clusterMoniker, clusterHash]);
    }

    /**
     * Convert to Uint8Array
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array() {
         // Actions
         const actionsUint8Array = serialize.fromObject(this.actions);
         const actionsTotalLengthUint8Array = varint.encodeVarInt(actionsUint8Array.value.length, 'uint8array');

         // Clusters
         const clustersUint8Array = serialize.fromObject(this.clusters);
         const clustersTotalLengthUint8Array = varint.encodeVarInt(clustersUint8Array.value.length, 'uint8array');

         const totalLength = 0
         + actionsTotalLengthUint8Array.length + actionsUint8Array.value.length
         + clustersTotalLengthUint8Array.length + clustersUint8Array.value.length;

         const result = new Uint8Array(totalLength);
         let offset = 0;

         result.set(actionsTotalLengthUint8Array, offset); offset += actionsTotalLengthUint8Array.length;
         result.set(actionsUint8Array.value, offset); offset += actionsUint8Array.value.length;

         result.set(clustersTotalLengthUint8Array, offset); offset += clustersTotalLengthUint8Array.length;
         result.set(clustersUint8Array.value, offset); offset += clustersUint8Array.value.length;

         return result;
    }

     /**
     * Computes the merkle root for the payload data
     * @param {string} encoding - The encoding
     * @returns {Uint8Array} The Merkle root
     */
     computeMerkleRoot(encoding = 'uint8array') {
        const hashes = [];

        // Hash actions
        for (const action of this.actions) {
            if (typeof action.toHash !== 'function') {
                throw new Error('Action must have a toHash method');
            }
            hashes.push(action.toHash('uint8array'));
        }

        // Hash clusters
        for (const cluster of this.clusters) {
            hashes.push(RelayBlockPayload.hashCluster(cluster));
        }

        if (hashes.length === 0) {
            return encoding === 'uint8array' ? new Uint8Array(32) : uint8array.toHex(new Uint8Array(32));
        }

        const tree = new MerkleTree(hashes, 'sha256');
        return tree.root(encoding);
    }


    /**
     * Convert to Hash
     * @param {string} encoding - The encoding
     * @returns {string} The Hash string
     */
    toHash(encoding = 'uint8array') {
        const uint8Array = this.toUint8Array();
        const hash = sha256(uint8Array);
        return encoding === 'uint8array' ? hash : uint8array.toHex(hash);
    }

    /**
     * Convert to JSON
     * @returns {Object} The JSON object
     */
    toJSON() {
        return {
            actions: this.actions,
            clusters: this.clusters,
        }
    }
}

export default RelayBlockPayload;
