import {  uint8array, varint, json } from '@scintilla-network/keys/utils';
import { sha256 } from '@scintilla-network/hashes/classic';
import { SignableMessage } from '@scintilla-network/keys';
import { serialize, deserialize } from '@scintilla-network/serialize';
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';

class GovernanceVote {
    /**
     * Create GovernanceVote
     * @param {Object} options - The options
     * @param {string} options.proposal - The proposal
     * @param {string} options.vote - The vote
     * @param {string} options.dao - The DAO
     * @param {number} options.timestamp - The timestamp
     * @param {string} options.voter - The voter
     * @param {number} options.votingPower - The voting power
     * @param {Authorization[]} options.authorizations - The authorizations
     * @returns {GovernanceVote} The GovernanceVote instance
     */
    constructor(options = {}) {
        this.kind = 'GOVERNANCEVOTE';
        this.version = 1;
        this.proposal = options.proposal || '';
        this.vote = options.vote || '';
        this.dao = options.dao || '';
        this.timestamp = options.timestamp ? BigInt(options.timestamp) : BigInt(Date.now());
        this.voter = options.voter || '';
        this.votingPower = options.votingPower || 0;
        this.authorizations = Authorization.fromAuthorizationsJSON({ authorizations: options?.authorizations });
    }

    /**
     * Create GovernanceVote from JSON
     * @param {Object} json - The JSON object
     * @returns {GovernanceVote} The GovernanceVote instance
     */
    static fromJSON(json) {
        return new GovernanceVote({
            ...json,
        });
    }

    /**
     * Create GovernanceVote from Uint8Array
     * @param {Uint8Array} inputArray - The Uint8Array
     * @returns {GovernanceVote} The GovernanceVote instance
     */
    static fromUint8Array(inputArray) {
        const voteProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['GOVERNANCEVOTE']) {
            throw new Error(`Invalid element kind: ${elementKind}(${NET_KINDS_ARRAY[elementKind]}) - Expected: ${NET_KINDS['GOVERNANCEVOTE']}(GOVERNANCEVOTE)`);
        }
        voteProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = deserialize.toVarInt(inputArray.subarray(offset));
        voteProps.version = version;
        offset += versionLength;

        const {value: timestamp, length: timestampBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        voteProps.timestamp = timestamp;
        offset += timestampBytes;

        // Proposal
        const {value: proposalLength, length: proposalLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += proposalLengthBytes;
        voteProps.proposal = uint8array.toString(inputArray.subarray(offset, offset + proposalLength));
        offset += proposalLength;

        // Vote
        const {value: voteLength, length: voteLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += voteLengthBytes;
        voteProps.vote = uint8array.toString(inputArray.subarray(offset, offset + voteLength));
        offset += voteLength;

        // DAO
        const {value: daoLength, length: daoLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += daoLengthBytes;
        voteProps.dao = uint8array.toString(inputArray.subarray(offset, offset + daoLength));
        offset += daoLength;

        // Voter
        const {value: voterLength, length: voterLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += voterLengthBytes;
        voteProps.voter = uint8array.toString(inputArray.subarray(offset, offset + voterLength));
        offset += voterLength;

        // Voting Power
        const {value: votingPower, length: votingPowerBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        voteProps.votingPower = votingPower;
        offset += votingPowerBytes;

        // Authorizations
        voteProps.authorizations = Authorization.fromAuthorizationsUint8Array(inputArray.subarray(offset));

        return new GovernanceVote(voteProps);
    }


    /**
     * Create GovernanceVote from hex
     * @param {string} hex - The hex string
     * @returns {GovernanceVote} The GovernanceVote instance
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return GovernanceVote.fromUint8Array(uint8Array);
    }

    /**
     * Convert to Uint8Array
     * @param {Object} options - The options
     * @param {boolean} options.excludeKindPrefix - Whether to exclude the kind prefix
     * @param {boolean} options.excludeAuthorizations - Whether to exclude the authorizations
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array(options = {}) {
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }

        const kind = NET_KINDS[this.kind];
        const {value: elementKindUint8Array, length: elementKindLengthUint8Array} = serialize.fromVarInt(kind, 'uint8array');
        const {value: versionUint8Array, length: versionLengthUint8Array} = serialize.fromVarInt(this.version, 'uint8array');
        const timestampUint8Array = varint.encodeVarInt(this.timestamp, 'uint8array');

        // Proposal
        const proposalUint8Array = uint8array.fromString(this.proposal);
        const {value: proposalLengthUint8Array, length: proposalLengthUint8ArrayBytes} = serialize.fromVarInt(proposalUint8Array.length, 'uint8array');

        // Vote
        const voteUint8Array = uint8array.fromString(this.vote);
        const {value: voteLengthUint8Array, length: voteLengthUint8ArrayBytes} = serialize.fromVarInt(voteUint8Array.length, 'uint8array');

        // DAO
        const daoUint8Array = uint8array.fromString(this.dao);
        const {value: daoLengthUint8Array, length: daoLengthUint8ArrayBytes} = serialize.fromVarInt(daoUint8Array.length, 'uint8array');

        // Voter
        const voterUint8Array = uint8array.fromString(this.voter);
        const {value: voterLengthUint8Array, length: voterLengthUint8ArrayBytes} = serialize.fromVarInt(voterUint8Array.length, 'uint8array');

        // Voting Power
        const {value: votingPowerUint8Array, length: votingPowerLengthUint8Array} = serialize.fromVarInt(this.votingPower, 'uint8array');

        // Authorizations
        let authorizationsUint8Array = new Uint8Array();
        if(options.excludeAuthorizations === false) {
            authorizationsUint8Array = Authorization.toAuthorizationsUint8Array(this.authorizations);
        }

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length)
            + versionUint8Array.length
            + timestampUint8Array.length
            + proposalLengthUint8Array.length + proposalUint8Array.length
            + voteLengthUint8Array.length + voteUint8Array.length
            + daoLengthUint8Array.length + daoUint8Array.length
            + voterLengthUint8Array.length + voterUint8Array.length
            + votingPowerUint8Array.length
            + (options.excludeAuthorizations ? 0 : authorizationsUint8Array.length);

        const result = new Uint8Array(totalLength);
        let offset = 0;

        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }

        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;

        // Proposal
        result.set(proposalLengthUint8Array, offset); offset += proposalLengthUint8Array.length;
        result.set(proposalUint8Array, offset); offset += proposalUint8Array.length;

        // Vote
        result.set(voteLengthUint8Array, offset); offset += voteLengthUint8Array.length;
        result.set(voteUint8Array, offset); offset += voteUint8Array.length;

        // DAO
        result.set(daoLengthUint8Array, offset); offset += daoLengthUint8Array.length;
        result.set(daoUint8Array, offset); offset += daoUint8Array.length;

        // Voter
        result.set(voterLengthUint8Array, offset); offset += voterLengthUint8Array.length;
        result.set(voterUint8Array, offset); offset += voterUint8Array.length;

        // Voting Power
        result.set(votingPowerUint8Array, offset); offset += votingPowerUint8Array.length;

        // Authorizations
        if(options.excludeAuthorizations === false) {
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }

        return result;
    }

    /**
     * Convert to hex
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude the authorizations
     * @returns {string} The hex string
     */
    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }

    /**
     * Convert to hash
     * @param {string} encoding - The encoding
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude the authorizations
     * @returns {string} The hash
     */
    toHash(encoding = 'uint8array', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    /**
     * Add an authorization
     * @param {Authorization} authorization - The authorization
     */
    addAuthorization(authorization) {
        authorization = new Authorization(authorization);
        if(authorization.signature === '' || authorization.signature === undefined){
            console.error('RelayBlock tried to add an empty authorization.');
            console.error(authorization);
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.addAuthorization(authorization);
    }

    /**
     * Verify the authorizations
     * @returns {boolean} True if the authorizations are valid
     */
    verifyAuthorizations() {
        return this.authorizations.every(auth => auth.verify(this).valid);
    }

    /**
     * Convert to signable message
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude the authorizations
     * @returns {SignableMessage} The signable message
     */
    toSignableMessage({excludeAuthorizations = false} = {}) {
        return new SignableMessage(this.toHex({excludeAuthorizations}));
    }

    /**
     * Sign the vote
     * @param {Wallet} signer - The signer
     * @returns {Promise<GovernanceVote>} The signed vote
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

    /**
     * Convert to hex
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude the authorizations
     * @returns {string} The hex string
     */
    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }

    /**
     * Validate the vote
     * @returns {Object} The validation result
     */
    validate() {
        if (!this.authorizations || this.authorizations.length === 0) {
            return {valid: false, error: 'Authorizations are required.'};
        }

        const signedAuthorizations = this.authorizations.filter(auth => auth.signature);
        if (signedAuthorizations.length === 0) {
            return {valid: false, error: 'At least one authorization with signature is required.'};
        }

        const authWithPublicKey = signedAuthorizations.filter(auth => auth.publicKey);
        if(authWithPublicKey.length === 0) {
            return {valid: false, error: 'At least one authorization with public key is required.'};
        }

        if (!this.verifyAuthorizations()) {
            return {valid: false, error: 'Invalid authorization.'};
        }

        return {valid: true, error: ''};
    }

    /**
     * Check if the vote is valid
     * @returns {boolean} True if the vote is valid
     */
    isValid() {
        const {valid, error} = this.validate();
        return valid;
    }

    /**
     * Convert to JSON
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude the authorizations
     * @returns {Object} The JSON object
     */
    toJSON({excludeAuthorizations = false} = {}) {
        const json = {
            kind: this.kind,
            version: this.version,
            timestamp: String(this.timestamp),
            proposal: this.proposal,
            vote: this.vote,
            dao: this.dao,
            voter: this.voter,
            votingPower: this.votingPower,
        };

        if (excludeAuthorizations === false) {
            json['authorizations'] = Authorization.toAuthorizationsJSON(this.authorizations);
        }

        return json;
    }
}

export { GovernanceVote };

export default GovernanceVote;

