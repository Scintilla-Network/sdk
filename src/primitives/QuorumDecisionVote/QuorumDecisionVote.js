import { sha256 } from "@scintilla-network/hashes/classic";
import {SignableMessage} from "@scintilla-network/keys";
import makeDoc from '../../utils/makeDoc.js';
import { varint, uint8array, varbigint } from '@scintilla-network/keys/utils';
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';
// import { deserialize } from '../../utils/deserialize/index.js';
import deserialize from '../../utils/deserialize/index.js';
import { serialize } from '../../utils/serialize/index.js';
/**
 * @class QuorumDecisionVote
 * @description Represents a vote on a quorum decision, with support for signing and verifying multiple authorizations.
 */
class QuorumDecisionVote {
    /**
     * @constructor
     * @param {Object} params - The parameters for creating a QuorumDecisionVote.
     * @param {string} params.decisionHash - The hash of the decision being voted on.
     * @param {string} params.voter - The voter identifier.
     * @param {string} params.vote - The vote (e.g., 'YES', 'NO').
     * @param {Object} params.payload - The payload of the vote.
     * @param {string} [params.timestamp] - The timestamp of the vote.
     */
    constructor({ decisionHash, voter, vote, payload, timestamp,authorizations }) {
        this.kind = NET_KINDS_ARRAY[NET_KINDS.QUORUMDECISIONVOTE];
        this.version = 1;
        this.timestamp = timestamp || BigInt(Date.now());
        this.decisionHash = decisionHash;
        this.voter = voter;
        this.vote = vote ?? [];
        this.payload = payload ?? [];
        this.authorizations = Authorization.fromAuthorizationsJSON({ authorizations });
    }

    static fromJSON(json) {
        return new QuorumDecisionVote({
            ...json,
        });
    }

    static fromHex(hex) {
        return QuorumDecisionVote.fromUint8Array(uint8array.fromHex(hex));
    }

    static fromUint8Array(inputArray) {
        const decisionProps = {};

        let offset = 0;

        // Kind
        const {value: elementKindValue, length: elementKindLengthUint8Array } = deserialize.toVarInt(inputArray.subarray(offset));
        const elementKind = NET_KINDS_ARRAY[elementKindValue];
        offset += elementKindLengthUint8Array;
        decisionProps.kind = elementKind;

        // Version
        const {value: version, length: versionLengthUint8Array } = deserialize.toVarInt(inputArray.subarray(offset));
        decisionProps.version = version;
        offset += versionLengthUint8Array;


        // Decision Hash
        const {value: decisionHash, length: decisionHashLengthUint8Array } = deserialize.toString(inputArray.subarray(offset));
        decisionProps.decisionHash = decisionHash;
        offset += decisionHashLengthUint8Array;

        // Timestamp
        const {value: timestamp, length: timestampLengthUint8Array } = deserialize.toVarBigInt(inputArray.subarray(offset));
        decisionProps.timestamp = timestamp;
        offset += timestampLengthUint8Array;

        // Voter
        const {value: voter, length: voterLengthUint8Array } = deserialize.toString(inputArray.subarray(offset));
        decisionProps.voter = voter;
        offset += voterLengthUint8Array;

        // Vote
        const {value: vote, length: voteLengthUint8Array } = deserialize.toString(inputArray.subarray(offset));
        decisionProps.vote = vote;
        offset += voteLengthUint8Array;

        // Payload
        const {value: payload, length: payloadLengthUint8Array} = deserialize.toObject(inputArray.subarray(offset));
        decisionProps.payload = payload;
        offset += payloadLengthUint8Array;

        // Authorizations
        if(inputArray?.subarray(offset)) {
            decisionProps.authorizations = Authorization.fromAuthorizationsUint8Array(inputArray?.subarray(offset));
        }

        return new QuorumDecisionVote(decisionProps);
    }


    toUint8Array(options = {}) {
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const { value: elementKindUint8Array, length: elementKindLengthUint8Array } = serialize.fromVarInt(NET_KINDS.QUORUMDECISIONVOTE, 'uint8array');
        const { value: versionUint8Array, length: versionLengthUint8Array } = serialize.fromVarInt(this.version, 'uint8array');

        const { value: decisionHashUint8Array, length: decisionHashLengthUint8Array } = serialize.fromString(this.decisionHash);
        const { value: timestampUint8Array, length: timestampLengthUint8Array } = serialize.fromVarBigInt(this.timestamp);
        const { value: voterUint8Array, length: voterLengthUint8Array } = serialize.fromString(this.voter);
        const { value: voteUint8Array, length: voteLengthUint8Array } = serialize.fromString(this.vote);
        const { value: payloadUint8Array, length: payloadLengthUint8Array } = serialize.fromObject(this.payload);
        // const { value: authorizationsUint8Array, length: authorizationsLengthUint8Array } = serialize.fromArray(this.authorizations);

        // const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['QUORUMDECISIONVOTE'], 'uint8array');
        // const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');
        // const timestampUint8Array = varbigint.encodeVarBigInt(this.timestamp, 'uint8array');

        // const decisionHashUint8Array = uint8array.fromString(this.decisionHash);
        // const decisionHashLengthUint8Array = varint.encodeVarInt(decisionHashUint8Array.length, 'uint8array');

        // const voterUint8Array = uint8array.fromString(this.voter);
        // const voterLengthUint8Array = varint.encodeVarInt(voterUint8Array.length, 'uint8array');

        // // const voteUint8Array = this.vote.toUint8Array();
        // // const voteLengthUint8Array = varint.encodeVarInt(voteUint8Array.length, 'uint8array');
        // const voteUint8Array = serialize.fromArray(this.vote);
        // const voteTotalLengthUint8Array = varint.encodeVarInt(voteUint8Array.value.length, 'uint8array');

        // const payloadUint8Array = serialize.fromArray(this.payload);
        // const payloadTotalLengthUint8Array = varint.encodeVarInt(payloadUint8Array.value.length, 'uint8array');

        let authorizationsUint8Array = new Uint8Array();
        if(options.excludeAuthorizations === false) {
            authorizationsUint8Array = Authorization.toAuthorizationsUint8Array(this.authorizations);
        }

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindLengthUint8Array) 
        + versionLengthUint8Array
        + timestampLengthUint8Array
        + decisionHashLengthUint8Array
        + voterLengthUint8Array
        + voteLengthUint8Array
        + payloadLengthUint8Array
        + (options.excludeAuthorizations ? 0 : authorizationsUint8Array.length);
        // + versionUint8Array.length 
        // + timestampUint8Array.length    
        // + decisionHashLengthUint8Array.length + decisionHashUint8Array.length 
        // + voterLengthUint8Array.length + voterUint8Array.length 
        // + voteTotalLengthUint8Array.length + voteUint8Array.value.length 
        // + payloadTotalLengthUint8Array.length + payloadUint8Array.value.length 
        // + (options.excludeAuthorizations ? 0 : authorizationsUint8Array.length);

        const result = new Uint8Array(totalLength);
        let offset = 0;
        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(decisionHashUint8Array, offset); offset += decisionHashUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;
        result.set(voterUint8Array, offset); offset += voterUint8Array.length;
        result.set(voteUint8Array, offset); offset += voteUint8Array.length;
        result.set(payloadUint8Array, offset); offset += payloadUint8Array.length;
        if(options.excludeAuthorizations === false) {
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }


        // result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;
        // result.set(decisionHashLengthUint8Array, offset); offset += decisionHashLengthUint8Array.length;
        // result.set(decisionHashUint8Array, offset); offset += decisionHashUint8Array.length;
        // result.set(voterLengthUint8Array, offset); offset += voterLengthUint8Array.length;
        // result.set(voterUint8Array, offset); offset += voterUint8Array.length;
        // result.set(voteTotalLengthUint8Array, offset); offset += voteTotalLengthUint8Array.length;
        // result.set(voteUint8Array, offset); offset += voteUint8Array.length;
        // result.set(payloadTotalLengthUint8Array, offset); offset += payloadTotalLengthUint8Array.length;
        // result.set(payloadUint8Array, offset); offset += payloadUint8Array.length;
        // if(options.excludeAuthorizations === false) {
        //     result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        // }
        return result;
    }




    /**
     * Converts the QuorumDecisionVote instance to a JSON object.
     * @param {boolean} [excludeAuthorizations = false] - Whether to exclude authorizations from the JSON.
     * @returns {Object} The JSON representation of the instance.
     */
    toJSON({ excludeAuthorizations = false } = {}) {
        const obj = {
            kind: this.kind,
            version: this.version,
            timestamp: this.timestamp,
            decisionHash: this.decisionHash,
            voter: this.voter,
            vote: this.vote,
            payload: this.payload,
        };

        if (excludeAuthorizations === false) {
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
        const buffer = this.toUint8Array({ excludeAuthorizations });
        return uint8array.toHex(buffer);
    }

    /**
     * Computes the hash of the QuorumDecision instance.
     * @param {string} [encoding='hex'] - The encoding of the hash.
     * @param {boolean} [excludeAuthorizations = false] - Whether to exclude authorizations from the hash.
     * @returns {string|Uint8Array} The hash of the instance.
     */
    toHash(encoding = 'hex', { excludeAuthorizations = true } = {}) {
        const buffer = this.toUint8Array({ excludeAuthorizations });
        const quorumDecisionHash = sha256(buffer);

        if (encoding === 'hex') {
            return uint8array.toHex(quorumDecisionHash);
        }
        return quorumDecisionHash;
    }
    /**
     * Signs the QuorumDecisionVote instance using the provided signer.
     * @param {Object} signer - The signer object, expected to have a signMessageWithSecp256k1 method.
     * @throws Will throw an error if signing fails.
     */
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

    toDoc(signer) {
        return makeDoc(this, signer);
    }

    toSignableMessage({excludeAuthorizations = false} = {}) {
        return new SignableMessage(this.toHex({excludeAuthorizations}));
    }

    /**
     * Verifies all signatures in the authorizations array.
     * @returns {boolean} True if all signatures are valid, false otherwise.
     * @throws Will throw an error if verification fails.
     */
    verifyAuthorizations() {
        return this.authorizations.every(auth => auth.verify(this).valid);
    }
   

    /**
     * Adds an authorization to the authorizations array.
     * @param {Object} authorization - The authorization object containing signature and publicKey.
     * @throws Will throw an error if the signature is missing or invalid.
     */
    addAuthorization(authorization) {
        if(authorization.signature === '' || authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.push(authorization);
    }



    /**
     * Validates the QuorumDecisionVote instance.
     * @returns {*}
     */
    validate() {
        if (!this.decisionHash) {
            return { valid: false, error: 'Decision hash is required.' };
        }

        if (!this.voter) {
            return { valid: false, error: 'Voter is required.' };
        }

        if (!this.vote) {
            return { valid: false, error: 'Vote is required.' };
        }

        if (!this.payload) {
            return { valid: false, error: 'Payload is required.' };
        }

        if (!this.timestamp) {
            return { valid: false, error: 'Timestamp is required.' };
        }

        if (!this.authorizations) return { valid: false, error: 'Authorizations are required.' };

        const signedAuthorizations = this.authorizations.filter(authorization => authorization.signature);
        if (!signedAuthorizations.length) return { valid: false, error: 'At least one authorization with signature is required.' };

        const authWithPublicKey = signedAuthorizations.filter(authorization => authorization.publicKey);
        if (authWithPublicKey.length < 0) return { valid: false, error: 'At least one authorization with public key is required.' };

        if (!this.verifyAuthorizations()) return { valid: false, error: `Invalid signature detected ${this.authorizations.length}` };
        return { valid: true, error: '' };
    }

    isValid() {
        const { valid } = this.validate();
        return valid;
    }
}

export { QuorumDecisionVote };
export default QuorumDecisionVote;
