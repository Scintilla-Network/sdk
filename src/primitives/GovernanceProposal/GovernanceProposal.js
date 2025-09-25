import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
import { utils } from '@scintilla-network/keys';
const { uint8array, varint, json, varbigint } = utils;
const { encodeVarInt, decodeVarInt } = varint;
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';
import makeDoc from '../../utils/makeDoc.js';
import signDoc from '../../utils/signDoc.js';
import verifyDoc from '../../utils/verifyDoc.js';
import { SignableMessage } from '@scintilla-network/keys';

class GovernanceProposal {
    constructor(options = {}) {
        this.kind = 'GOVERNANCE_PROPOSAL';
        this.version = 1;
        this.timestamp = options.timestamp || BigInt(Date.now());
        
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
        this.startDate = options.startDate || BigInt(Date.now());
        this.endDate = options.endDate || BigInt(Date.now() + 10000);
        if (!this.endDate) {
            throw new Error('GovernanceProposal must have an end date');
        }
        this.proposer = options.proposer || '';
        this.dao = options.dao || '';
        this.authorizations = (options.authorizations || []).map(auth => new Authorization(auth));
        this.hash = options.hash ?? null;
        if (!this.hash) {
            this.hash = this.computeHash();
        }
    }

    considerVote({ vote, voter, votingPower }) {
        if(this.votes.find(v => v.voter === voter)) {
            // remove previous vote
            this.votes = this.votes.filter(v => v.voter !== voter);
        }
        const normalizeVotingPower = Math.abs(votingPower);
        this.votes.push({ vote, voter, votingPower:normalizeVotingPower });
        this.totalVotes += normalizeVotingPower;
    }

    toUint8Array(options = {}) {
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }
        if(options.excludeAuthorization === undefined) {
            options.excludeAuthorization = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['GOVERNANCE_PROPOSAL'], 'uint8array');
        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');
        const timestampUint8Array = varint.encodeVarInt(this.timestamp, 'uint8array');

        // Title
        const titleUint8Array = uint8array.fromString(this.title);
        const titleLengthUint8Array = varint.encodeVarInt(titleUint8Array.length, 'uint8array');

        // Description
        const descriptionUint8Array = uint8array.fromString(this.description);
        const descriptionLengthUint8Array = varint.encodeVarInt(descriptionUint8Array.length, 'uint8array');

        // Funding (as JSON)
        const fundingString = json.sortedJsonByKeyStringify(this.funding);
        const fundingUint8Array = uint8array.fromString(fundingString);
        const fundingLengthUint8Array = varint.encodeVarInt(fundingUint8Array.length, 'uint8array');

        // Rules (as JSON)
        const rulesString = json.sortedJsonByKeyStringify(this.rules);
        const rulesUint8Array = uint8array.fromString(rulesString);
        const rulesLengthUint8Array = varint.encodeVarInt(rulesUint8Array.length, 'uint8array');

        // Status
        const statusUint8Array = uint8array.fromString(this.status);
        const statusLengthUint8Array = varint.encodeVarInt(statusUint8Array.length, 'uint8array');

        // Votes (as JSON)
        const votesString = json.sortedJsonByKeyStringify(this.votes);
        const votesUint8Array = uint8array.fromString(votesString);
        const votesLengthUint8Array = varint.encodeVarInt(votesUint8Array.length, 'uint8array');

        // Total Votes
        const totalVotesUint8Array = varint.encodeVarInt(this.totalVotes, 'uint8array');

        // Start Date
        const startDateUint8Array = varint.encodeVarInt(this.startDate, 'uint8array');

        // End Date
        const endDateUint8Array = varint.encodeVarInt(this.endDate, 'uint8array');

        // Proposer
        const proposerUint8Array = uint8array.fromString(this.proposer);
        const proposerLengthUint8Array = varint.encodeVarInt(proposerUint8Array.length, 'uint8array');

        // DAO
        const daoUint8Array = uint8array.fromString(this.dao);
        const daoLengthUint8Array = varint.encodeVarInt(daoUint8Array.length, 'uint8array');

        // Hash
        const hashUint8Array = uint8array.fromString(this.hash);
        const hashLengthUint8Array = varint.encodeVarInt(hashUint8Array.length, 'uint8array');

        // Authorizations
        const authorizationsLengthUint8Array = varint.encodeVarInt(this.authorizations.length, 'uint8array');
        const authorizationsUint8Array = [];
        this.authorizations.forEach(authorization => {
            const authorizationUint8Array = authorization.toUint8Array();
            authorizationsUint8Array.push(...authorizationUint8Array);
        });

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length)
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
            + (options.excludeAuthorization ? 0 : authorizationsLengthUint8Array.length + authorizationsUint8Array.length);

        const result = new Uint8Array(totalLength);
        let offset = 0;

        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
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
        if(options.excludeAuthorization === false) {
            result.set(authorizationsLengthUint8Array, offset); offset += authorizationsLengthUint8Array.length;
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }

        return result;
    }

    static fromUint8Array(inputArray) {
        const proposalProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['GOVERNANCE_PROPOSAL']) {
            throw new Error('Invalid element kind');
        }
        proposalProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = varint.decodeVarInt(inputArray.subarray(offset));
        proposalProps.version = version;
        offset += versionLength;

        const {value: timestamp, length: timestampBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        proposalProps.timestamp = timestamp;
        offset += timestampBytes;

        // Title
        const {value: titleLength, length: titleLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += titleLengthBytes;
        proposalProps.title = uint8array.toString(inputArray.subarray(offset, offset + titleLength));
        offset += titleLength;

        // Description
        const {value: descriptionLength, length: descriptionLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += descriptionLengthBytes;
        proposalProps.description = uint8array.toString(inputArray.subarray(offset, offset + descriptionLength));
        offset += descriptionLength;

        // Funding
        const {value: fundingLength, length: fundingLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += fundingLengthBytes;
        const fundingString = uint8array.toString(inputArray.subarray(offset, offset + fundingLength));
        proposalProps.funding = json.parse(fundingString);
        offset += fundingLength;

        // Rules
        const {value: rulesLength, length: rulesLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += rulesLengthBytes;
        const rulesString = uint8array.toString(inputArray.subarray(offset, offset + rulesLength));
        proposalProps.rules = json.parse(rulesString);
        offset += rulesLength;

        // Status
        const {value: statusLength, length: statusLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += statusLengthBytes;
        proposalProps.status = uint8array.toString(inputArray.subarray(offset, offset + statusLength));
        offset += statusLength;

        // Votes
        const {value: votesLength, length: votesLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += votesLengthBytes;
        const votesString = uint8array.toString(inputArray.subarray(offset, offset + votesLength));
        proposalProps.votes = json.parse(votesString);
        offset += votesLength;

        // Total Votes
        const {value: totalVotes, length: totalVotesBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        proposalProps.totalVotes = totalVotes;
        offset += totalVotesBytes;

        // Start Date
        const {value: startDate, length: startDateBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        proposalProps.startDate = startDate;
        offset += startDateBytes;

        // End Date
        const {value: endDate, length: endDateBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        proposalProps.endDate = endDate;
        offset += endDateBytes;

        // Proposer
        const {value: proposerLength, length: proposerLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += proposerLengthBytes;
        proposalProps.proposer = uint8array.toString(inputArray.subarray(offset, offset + proposerLength));
        offset += proposerLength;

        // DAO
        const {value: daoLength, length: daoLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += daoLengthBytes;
        proposalProps.dao = uint8array.toString(inputArray.subarray(offset, offset + daoLength));
        offset += daoLength;

        // Hash
        const {value: hashLength, length: hashLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += hashLengthBytes;
        proposalProps.hash = uint8array.toString(inputArray.subarray(offset, offset + hashLength));
        offset += hashLength;

        // Authorizations
        const authorizations = [];
        if (offset < inputArray.length) {
            const {value: authorizationsAmount, length: authorizationsAmountBytes} = varint.decodeVarInt(inputArray.subarray(offset));
            offset += authorizationsAmountBytes;
            for (let i = 0; i < authorizationsAmount; i++) {
                const authorization = Authorization.fromUint8Array(inputArray.subarray(offset));
                const authorizationBytes = authorization.toUint8Array();
                offset += authorizationBytes.length;
                authorizations.push(authorization);
            }
        }
        proposalProps.authorizations = authorizations;

        return new GovernanceProposal(proposalProps);
    }

    toBuffer() {
        return this.toUint8Array();
    }

    static fromBuffer(buffer) {
        const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        return GovernanceProposal.fromUint8Array(uint8Array);
    }

    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return GovernanceProposal.fromUint8Array(uint8Array);
    }

    computeHash() {
        const uint8Array = this.toUint8Array();
        const hashUint8Array = sha256(uint8Array);
        return uint8array.toHex(hashUint8Array);
    }

    toHash(encoding = 'hex') {
        const uint8Array = this.toUint8Array();
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hashUint8Array) : hashUint8Array;
    }

    addAuthorization(authorization) {
        if(authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.push(new Authorization(authorization));
    }

    verifySignature() {
        return verifyDoc(this);
    }

    toSignableMessage({excludeAuthorization = false} = {}) {
        return new SignableMessage(this.toHex({excludeAuthorization}));
    }

    toDoc(signer) {
        return makeDoc(this, signer);
    }

    async sign(signer) {
        return signDoc(await this.toDoc(signer));
    }

    toHex({excludeAuthorization = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorization}));
    }

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

        if (!this.verifySignature()) {
            return {valid: false, error: 'Invalid signature.'};
        }

        return {valid: true, error: ''};
    }

    isValid() {
        const {valid, error} = this.validate();
        console.log('error', error);
        return valid;
    }

    toJSON({excludeAuthorization = false} = {}) {
        const json = {
            kind: this.kind,
            version: this.version,
            timestamp: String(this.timestamp),
            hash: this.hash,
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

        if (!excludeAuthorization) {
            json.authorizations = this.authorizations.map(auth => ({
                ...auth,
                signature: auth.signature ? uint8array.toHex(auth.signature) : '',
                publicKey: auth.publicKey ? uint8array.toHex(auth.publicKey) : ''
            }));
        }

        return json;
    }
}

export { GovernanceProposal };

export default GovernanceProposal;

