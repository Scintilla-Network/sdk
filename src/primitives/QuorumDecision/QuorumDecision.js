import { sha256 } from "@scintilla-network/hashes/classic";
import { varint, varbigint, uint8array } from '@scintilla-network/keys/utils'
import {SignableMessage} from "@scintilla-network/keys";
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js'
import { Authorization } from '../Authorization/Authorization.js';
import { serialize, deserialize } from '@scintilla-network/serialize';

/**
 * @class QuorumDecision
 * @description Represents a decision made by the quorum, with support for signing and verifying multiple signatures.
 */
class QuorumDecision {
    /**
     * @constructor
     * @param {Object} params - The parameters for creating a QuorumDecision.
     * @param {string} params.proposer - The proposer of the decision.
     * @param {string} params.cluster - The cluster in which the quorum resides.
     * @param {string} params.quorum - The quorum identifier.
     * @param {Object} params.payload - The payload of the decision.
     * @param {string} params.action - The action of the decision.
     * @param {BigInt} [params.timestamp] - The timestamp of the decision.
     */
    constructor({ proposer, cluster, quorum, payload, action, timestamp, authorizations }) {
        this.kind = NET_KINDS_ARRAY[NET_KINDS.QUORUMDECISION];
        this.version = 1;
        this.timestamp = timestamp || BigInt(Date.now());
        this.action = action;
        this.proposer = proposer;
        this.cluster = cluster;
        this.quorum = quorum;
        this.payload = payload ?? [];
        this.authorizations = Authorization.fromAuthorizationsJSON({ authorizations });

    }

    /**
     * Create QuorumDecision from Uint8Array
     * @param {Uint8Array} inputArray - The Uint8Array
     * @returns {QuorumDecision} The QuorumDecision instance
     */
    static fromUint8Array(inputArray) {
        const decisionProps = {};

        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['QUORUMDECISION']) {
            throw new Error('Invalid element kind');
        }
        decisionProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = varint.decodeVarInt(inputArray.subarray(offset));
        decisionProps.version = version;
        offset += versionLength;

        const { value: cluster, length: clusterLength } = deserialize.toString(inputArray.subarray(offset));
        offset += clusterLength;
        decisionProps.cluster = cluster;

        // Timestamp
        const { value: timestamp, length: timestampLength } = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += timestampLength;
        decisionProps.timestamp = timestamp;

        // Quorum
        const { value: quorum, length: quorumLength } = deserialize.toString(inputArray.subarray(offset));
        offset += quorumLength;
        decisionProps.quorum = quorum;

        // Action
        const { value: action, length: actionLength } = deserialize.toString(inputArray.subarray(offset));
        offset += actionLength;
        decisionProps.action = action;

        // Proposer
        const { value: proposer, length: proposerLength } = deserialize.toString(inputArray.subarray(offset));
        offset += proposerLength;
        decisionProps.proposer = proposer;

        // Payload
        const { value: payload, length: payloadLength } = deserialize.toObject(inputArray.subarray(offset));
        offset += payloadLength;
        decisionProps.payload = payload;

        // Authorizations
        decisionProps.authorizations = Authorization.fromAuthorizationsUint8Array(inputArray.subarray(offset));

        return new QuorumDecision(decisionProps);
    }

    /**
     * Convert to Uint8Array
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude the authorizations
     * @param {boolean} options.excludeKindPrefix - Whether to exclude the kind prefix
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array(options = {}) {
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        // const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['QUORUMDECISION'], 'uint8array');
        // const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');

        const { value: elementKindUint8Array, length: elementKindLengthUint8Array } = serialize.fromVarInt(NET_KINDS.QUORUMDECISION, 'uint8array');
        const { value: versionUint8Array, length: versionLengthUint8Array } = serialize.fromVarInt(this.version, 'uint8array');

        const { value: clusterUint8Array, length: clusterLengthUint8Array }= serialize.fromString(this.cluster);
        const { value: timestampUint8Array, length: timestampLengthUint8Array } = serialize.fromVarBigInt(this.timestamp);
        const { value: quorumUint8Array, length: quorumLengthUint8Array } = serialize.fromString(this.quorum);
        const { value: actionUint8Array, length: actionLengthUint8Array } = serialize.fromString(this.action);
        const { value: proposerUint8Array, length: proposerLengthUint8Array } = serialize.fromString(this.proposer);
        const { value: payloadUint8Array, length: payloadLengthUint8Array } = serialize.fromObject(this.payload);

        let authorizationsUint8Array = new Uint8Array();
        if(options.excludeAuthorizations === false) {
            authorizationsUint8Array = Authorization.toAuthorizationsUint8Array(this.authorizations);
        }

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindLengthUint8Array) 
        + versionLengthUint8Array 
        + clusterLengthUint8Array
        + timestampLengthUint8Array
        + quorumLengthUint8Array
        + actionLengthUint8Array
        + proposerLengthUint8Array
        + payloadLengthUint8Array
        + (options.excludeAuthorizations ? 0 : authorizationsUint8Array.length);

        const result = new Uint8Array(totalLength);
        let offset = 0;
        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(clusterUint8Array, offset); offset += clusterUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;
        result.set(quorumUint8Array, offset); offset += quorumUint8Array.length;
        result.set(actionUint8Array, offset); offset += actionUint8Array.length;
        result.set(proposerUint8Array, offset); offset += proposerUint8Array.length;

        result.set(payloadUint8Array, offset); offset += payloadUint8Array.length;
        if(options.excludeAuthorizations === false) {
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }
        return result;
    }

    /**
     * Create QuorumDecision from hex
     * @param {string} hex - The hex string
     * @returns {QuorumDecision} The QuorumDecision instance
     */
    static fromHex(hex) {
        const array = uint8array.fromHex(hex);
        return QuorumDecision.fromUint8Array(array);
    }

    /**
     * Create QuorumDecision from JSON
     * @param {Object} json - The JSON object
     * @returns {QuorumDecision} The QuorumDecision instance
     */
    static fromJSON(json) {
        return new QuorumDecision({
            ...json,
        });
    }

    /**
     * Converts the QuorumDecision instance to a JSON object.
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude the authorizations
     * @returns {Object} The JSON object
     */
    toJSON({ excludeAuthorizations = false } = {}) {
        const obj = {
            kind: this.kind,
            version: this.version,
            timestamp: this.timestamp,
            action: this.action,
            proposer: this.proposer,
            cluster: this.cluster,
            quorum: this.quorum,
            payload: this.payload,
        };

        if (!excludeAuthorizations) {
            obj['authorizations'] = this.authorizations;
        }

        return obj;
    }

    /**
     * Converts the QuorumDecision instance to a hex string.
     * @param {boolean} [excludeAuthorizations = false] - Whether to exclude authorizations from the hex string.
     * @returns {string} The hex string representation of the instance.
     */
    toHex({ excludeAuthorizations = false } = {}) {
        const array = this.toUint8Array({ excludeAuthorizations });
        return uint8array.toHex(array);
    }

    /**
     * Computes the hash of the QuorumDecision instance.
     * @param {string} [encoding='hex'] - The encoding of the hash.
     * @param {boolean} [excludeAuthorizations = false] - Whether to exclude authorizations from the hash.
     * @returns {string|Uint8Array} The hash of the instance.
     */
    toHash(encoding = 'uint8array', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    /**
     * Signs the QuorumDecision instance using the provided signer.
     * @param {Object} signer - The signer object, expected to have a signMessageWithSecp256k1 method.
     * @throws Will throw an error if signing fails.
     */
    async sign(signer) {
        let authorization = new Authorization();
        const existingAuthorization = this.authorizations.find(auth => auth.moniker === signer.getMoniker());
        if(existingAuthorization){
            this.authorizations.splice(this.authorizations.indexOf(existingAuthorization), 1);
        }
        authorization = await authorization.sign(this, signer, true);
        this.authorizations.push(authorization);
        return this;
    }

    toSignableMessage() {
        return new SignableMessage(this.toJSON());
    }
    /**
     * Verifies all authorizations in the authorizations array.
     * @returns {boolean} True if all signatures are valid, false otherwise.
     * @throws Will throw an error if verification fails.
     */
    verifyAuthorizations() {
        return this.authorizations.every(auth => auth.verify(this).valid);
    }
    /**
    * Adds a signature to the signatures array.
     * @param {Object} signature - The signature object containing signature and publicKey.
     * @throws Will throw an error if the signature is missing or invalid.
     */
    
    addAuthorization(authorization) {
        if(authorization.signature === '' || authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.push(authorization);
    }

    /**
     * Validates the QuorumDecision instance.
     * @returns {*}
     */
    validate() {
        if (!this.proposer) {
            return {valid: false, error: 'Proposer is required.'};
        }

        if (!this.cluster) {
            return {valid: false, error: 'Cluster is required.'};
        }

        if (!this.quorum) {
            return {valid: false, error: 'Quorum is required.'};
        }

        if (!this.payload) {
            return {valid: false, error: 'Payload is required.'};
        }

        if (!this.action) {
            return {valid: false, error: 'Action is required.'};
        }

        if (!this.timestamp) {
            return {valid: false, error: 'Timestamp is required.'};
        }

        if (!this.authorizations) return {valid: false, error: 'Authorizations are required.'};

        const signedAuthorizations = this.authorizations.filter(authorization => authorization.signature);
        if (!signedAuthorizations.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedAuthorizations.filter(authorization => authorization.publicKey);
        if(authWithPublicKey.length < 0) return {valid: false, error: 'At least one authorization with public key is required.'};

        if (!this.verifyAuthorizations()) return {valid: false,error: `Invalid signature detected ${this.authorizations.length}`};
        return {valid: true, error: ''};

    }

    /**
     * Validates the QuorumDecision instance.
     * @returns {boolean} True if the QuorumDecision instance is valid, false otherwise.
     */
    isValid() {
        const {valid, error} = this.validate();
        if(!valid){
            console.log('Invalid decision', error);
        }
        return valid;
    }
}

export { QuorumDecision };
export default QuorumDecision;
