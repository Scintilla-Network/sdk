import { serialize, deserialize } from '@scintilla-network/serialize';
import { uint8array, json, hex } from '@scintilla-network/keys/utils';
import { SignableMessage } from '@scintilla-network/keys';
import { sha256 } from '@scintilla-network/hashes/classic';

import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';

class GovernanceProposal {
    /**
     * Create GovernanceProposal
     * @param {Object} options - The options
     * @param {number} options.timestamp - The timestamp
     * @param {string} options.title - The title
     * @param {string} options.description - The description
     * @param {Object} options.funding - The funding
     * @param {string} options.rules - The rules
     */ 
    constructor(options = {}) {
        /**
         * The kind of the proposal
         * @type {string}
         */
        this.kind = 'GOVERNANCEPROPOSAL';
        this.version = 1;
        this.timestamp = options.timestamp ? BigInt(options.timestamp) : BigInt(Date.now());
        
        this.title = options.title || '';
        this.description = options.description || '';
        this.funding = options.funding || null;
        if (this.funding && !this.funding.recipient) {
            throw new Error('GovernanceProposal with funding must have a recipient');
        }

        this.rules = options.rules ?? [{ kind: 'type', options: ['yes', 'no', 'abstain'], value: 'oneOf' }];

        this.status = options.status ?? 'proposed';
        this.votes = options.votes ?? [];
        this.totalVotes = options.totalVotes ?? 0;
        this.startDate = options.startDate ? BigInt(options.startDate) : BigInt(Date.now());
        this.endDate = options.endDate ? BigInt(options.endDate) : BigInt(Date.now() + 10000);
        if (!this.endDate) {
            throw new Error('GovernanceProposal must have an end date');
        }
        this.proposer = options.proposer || '';
        this.dao = options.dao || '';
        this.authorizations = Authorization.fromAuthorizationsJSON({ authorizations: options.authorizations });
        this.hash = this.toHash('uint8array', {excludeAuthorizations: true});
    }

    /**
     * Create GovernanceProposal from JSON
     * @param {Object} json - The JSON object
     * @returns {GovernanceProposal} The GovernanceProposal instance
     */
    static fromJSON(json) {
        return new GovernanceProposal({
            ...json,
        });
    }

    /**
     * Create GovernanceProposal from hex
     * @param {string} hex - The hex string
     * @returns {GovernanceProposal} The GovernanceProposal instance
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return GovernanceProposal.fromUint8Array(uint8Array);
    }


    /**
     * Create GovernanceProposal from Uint8Array
     * @param {Uint8Array} inputArray - The Uint8Array
     * @returns {GovernanceProposal} The GovernanceProposal instance
     */
    static fromUint8Array(inputArray) {
        const proposalProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['GOVERNANCEPROPOSAL']) {
            throw new Error(`Invalid element kind: ${elementKind}(${NET_KINDS_ARRAY[elementKind]}) - Expected: ${NET_KINDS['GOVERNANCEPROPOSAL']}(GOVERNANCEPROPOSAL)`);
        }
        proposalProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = deserialize.toVarInt(inputArray.subarray(offset));
        proposalProps.version = version;
        offset += versionLength;

        const {value: timestamp, length: timestampBytes} = deserialize.toVarBigInt(inputArray.subarray(offset));
        proposalProps.timestamp = timestamp;
        offset += timestampBytes;

        // Title
        const {value: titleLength, length: titleLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += titleLengthBytes;
        proposalProps.title = uint8array.toString(inputArray.subarray(offset, offset + titleLength));
        offset += titleLength;

        // Description
        const {value: descriptionLength, length: descriptionLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += descriptionLengthBytes;
        proposalProps.description = uint8array.toString(inputArray.subarray(offset, offset + descriptionLength));
        offset += descriptionLength;

        // Funding
        const {value: fundingLength, length: fundingLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += fundingLengthBytes;
        const fundingString = uint8array.toString(inputArray.subarray(offset, offset + fundingLength));
        proposalProps.funding = json.parse(fundingString);
        offset += fundingLength;

        // Rules
        const {value: rulesLength, length: rulesLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += rulesLengthBytes;
        const rulesString = uint8array.toString(inputArray.subarray(offset, offset + rulesLength));
        proposalProps.rules = json.parse(rulesString);
        offset += rulesLength;

        // Status
        const {value: statusLength, length: statusLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += statusLengthBytes;
        proposalProps.status = uint8array.toString(inputArray.subarray(offset, offset + statusLength));
        offset += statusLength;

        // Votes
        const {value: votesLength, length: votesLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += votesLengthBytes;
        const votesString = uint8array.toString(inputArray.subarray(offset, offset + votesLength));
        proposalProps.votes = json.parse(votesString);
        offset += votesLength;

        // Total Votes
        const {value: totalVotes, length: totalVotesBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        proposalProps.totalVotes = totalVotes;
        offset += totalVotesBytes;

        // Start Date
        const {value: startDate, length: startDateBytes} = deserialize.toVarBigInt(inputArray.subarray(offset));
        proposalProps.startDate = startDate;
        offset += startDateBytes;

        // End Date
        const {value: endDate, length: endDateBytes} = deserialize.toVarBigInt(inputArray.subarray(offset));
        proposalProps.endDate = endDate;
        offset += endDateBytes;

        // Proposer
        const {value: proposerLength, length: proposerLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += proposerLengthBytes;
        proposalProps.proposer = uint8array.toString(inputArray.subarray(offset, offset + proposerLength));
        offset += proposerLength;

        // DAO
        const {value: daoLength, length: daoLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += daoLengthBytes;
        proposalProps.dao = uint8array.toString(inputArray.subarray(offset, offset + daoLength));
        offset += daoLength;

        // Hash
        const {value: hashLength, length: hashLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += hashLengthBytes;
        proposalProps.hash = uint8array.toString(inputArray.subarray(offset, offset + hashLength));
        offset += hashLength;

        // Authorizations
        proposalProps.authorizations = Authorization.fromAuthorizationsUint8Array(inputArray.subarray(offset));

        return new GovernanceProposal(proposalProps);
    }


    /**
     * Consider a vote
     * @param {Object} options - The options
     * @param {string} options.vote - The vote
     * @param {string} options.voter - The voter
     * @param {number} options.votingPower - The voting power
     */
    considerVote({ vote, voter, votingPower }) {
        if(this.votes.find(v => v.voter === voter)) {
            // remove previous vote
            this.votes = this.votes.filter(v => v.voter !== voter);
        }
        const normalizeVotingPower = Math.abs(votingPower);
        this.votes.push({ vote, voter, votingPower:normalizeVotingPower });
        this.totalVotes += normalizeVotingPower;
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
        const {value: kindUint8Array, length: kindLengthUint8Array} = serialize.fromVarInt(kind, 'uint8array');
        const {value: versionUint8Array, length: versionLengthUint8Array} = serialize.fromVarInt(this.version, 'uint8array');
        const {value: timestampUint8Array, length: timestampLengthUint8Array} = serialize.fromVarBigInt(this.timestamp, 'uint8array');

        // Title
        const titleUint8Array = uint8array.fromString(this.title);
        const {value: titleLengthUint8Array, length: titleLengthUint8ArrayLength} = serialize.fromVarInt(titleUint8Array.length, 'uint8array');

        // Description
        const descriptionUint8Array = uint8array.fromString(this.description);
        const {value: descriptionLengthUint8Array, length: descriptionLengthUint8ArrayLength} = serialize.fromVarInt(descriptionUint8Array.length, 'uint8array');

        // Funding (as JSON)
        const fundingString = json.sortedJsonByKeyStringify(this.funding);
        const fundingUint8Array = uint8array.fromString(fundingString);
        const {value: fundingLengthUint8Array, length: fundingLengthUint8ArrayLength} = serialize.fromVarInt(fundingUint8Array.length, 'uint8array');

        // Rules (as JSON)
        const rulesString = json.sortedJsonByKeyStringify(this.rules);
        const rulesUint8Array = uint8array.fromString(rulesString);
        const {value: rulesLengthUint8Array, length: rulesLengthUint8ArrayLength} = serialize.fromVarInt(rulesUint8Array.length, 'uint8array');

        // Status
        const statusUint8Array = uint8array.fromString(this.status);
        const {value: statusLengthUint8Array, length: statusLengthUint8ArrayLength} = serialize.fromVarInt(statusUint8Array.length, 'uint8array');

        // Votes (as JSON)
        const votesString = json.sortedJsonByKeyStringify(this.votes);
        const votesUint8Array = uint8array.fromString(votesString);
        const {value: votesLengthUint8Array, length: votesLengthUint8ArrayLength} = serialize.fromVarInt(votesUint8Array.length, 'uint8array');

        // Total Votes
        const {value: totalVotesUint8Array, length: totalVotesUint8ArrayLength} = serialize.fromVarInt(this.totalVotes, 'uint8array');

        // Start Date
        const {value: startDateUint8Array, length: startDateUint8ArrayLength} = serialize.fromVarBigInt(this.startDate, 'uint8array');

        // End Date
        const {value: endDateUint8Array, length: endDateUint8ArrayLength} = serialize.fromVarBigInt(this.endDate, 'uint8array');

        // Proposer
        const proposerUint8Array = uint8array.fromString(this.proposer);
        const {value: proposerLengthUint8Array, length: proposerLengthUint8ArrayLength} = serialize.fromVarInt(proposerUint8Array.length, 'uint8array');

        // DAO
        const daoUint8Array = uint8array.fromString(this.dao);
        const {value: daoLengthUint8Array, length: daoLengthUint8ArrayLength} = serialize.fromVarInt(daoUint8Array.length, 'uint8array');

        // Hash
        const hashUint8Array = uint8array.fromString(this.hash);
        const {value: hashLengthUint8Array, length: hashLengthUint8ArrayLength} = serialize.fromVarInt(hashUint8Array.length, 'uint8array');

        // Authorizations
        let authorizationsUint8Array = new Uint8Array();
        if(options.excludeAuthorizations === false) {
            authorizationsUint8Array = Authorization.toAuthorizationsUint8Array(this.authorizations);
        }

        const totalLength = (options.excludeKindPrefix ? 0 : kindUint8Array.length)
            + versionUint8Array.length
            + timestampUint8Array.length
            + titleLengthUint8Array.length + titleUint8Array.length
            + descriptionLengthUint8Array.length + descriptionUint8Array.length
            + fundingLengthUint8Array.length + fundingUint8Array.length
            + rulesLengthUint8Array.length + rulesUint8Array.length
            + statusLengthUint8Array.length + statusUint8Array.length
            + votesLengthUint8Array.length + votesUint8Array.length
            + totalVotesUint8Array.length
            + startDateUint8Array.length
            + endDateUint8Array.length
            + proposerLengthUint8Array.length + proposerUint8Array.length
            + daoLengthUint8Array.length + daoUint8Array.length
            + hashLengthUint8Array.length + hashUint8Array.length
            + (options.excludeAuthorizations ? 0 : authorizationsUint8Array.length);

        const result = new Uint8Array(totalLength);
        let offset = 0;

        if(options.excludeKindPrefix === false) {
            result.set(kindUint8Array, offset); offset += kindUint8Array.length;
        }

        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;

        // Title
        result.set(titleLengthUint8Array, offset); offset += titleLengthUint8Array.length;
        result.set(titleUint8Array, offset); offset += titleUint8Array.length;

        // Description
        result.set(descriptionLengthUint8Array, offset); offset += descriptionLengthUint8Array.length;
        result.set(descriptionUint8Array, offset); offset += descriptionUint8Array.length;

        // Funding
        result.set(fundingLengthUint8Array, offset); offset += fundingLengthUint8Array.length;
        result.set(fundingUint8Array, offset); offset += fundingUint8Array.length;

        // Rules
        result.set(rulesLengthUint8Array, offset); offset += rulesLengthUint8Array.length;
        result.set(rulesUint8Array, offset); offset += rulesUint8Array.length;

        // Status
        result.set(statusLengthUint8Array, offset); offset += statusLengthUint8Array.length;
        result.set(statusUint8Array, offset); offset += statusUint8Array.length;

        // Votes
        result.set(votesLengthUint8Array, offset); offset += votesLengthUint8Array.length;
        result.set(votesUint8Array, offset); offset += votesUint8Array.length;

        // Total Votes
        result.set(totalVotesUint8Array, offset); offset += totalVotesUint8Array.length;

        // Start Date
        result.set(startDateUint8Array, offset); offset += startDateUint8Array.length;

        // End Date
        result.set(endDateUint8Array, offset); offset += endDateUint8Array.length;

        // Proposer
        result.set(proposerLengthUint8Array, offset); offset += proposerLengthUint8Array.length;
        result.set(proposerUint8Array, offset); offset += proposerUint8Array.length;

        // DAO
        result.set(daoLengthUint8Array, offset); offset += daoLengthUint8Array.length;
        result.set(daoUint8Array, offset); offset += daoUint8Array.length;

        // Hash
        result.set(hashLengthUint8Array, offset); offset += hashLengthUint8Array.length;
        result.set(hashUint8Array, offset); offset += hashUint8Array.length;

        // Authorizations
        if(options.excludeAuthorizations === false) {
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }

        return result;
    }

    /**
     * Convert to hex
     * @returns {string} The hex string
     */
    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    /**
     * Convert to hash
     * @param {string} encoding - The encoding
     * @returns {string} The hash
     */
    toHash(encoding = 'uint8array', {excludeAuthorizations = true} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    /**
     * Add an authorization
     * @param {Authorization} authorization - The authorization
     */
    addAuthorization(authorization) {
        if(authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.addAuthorization(new Authorization(authorization));
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
     * Sign the proposal
     * @param {Wallet} signer - The signer
     * @returns {Promise<GovernanceProposal>} The signed proposal
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
     * Validate the proposal
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
     * Check if the proposal is valid
     * @returns {boolean} True if the proposal is valid
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
            hash: hex.fromUint8Array(this.hash),
            title: this.title,
            description: this.description,
            funding: this.funding,
            status: this.status,
            votes: this.votes,
            rules: this.rules,
            totalVotes: this.totalVotes,
            startDate: String(this.startDate),
            endDate: String(this.endDate),
            proposer: this.proposer,
            dao: this.dao,
        };

        if (excludeAuthorizations === false) {
            json['authorizations'] = Authorization.toAuthorizationsJSON(this.authorizations);
        }
        return json;
    }
}

export { GovernanceProposal };

export default GovernanceProposal;

