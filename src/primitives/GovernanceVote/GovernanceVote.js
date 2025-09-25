import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
import { utils } from '@scintilla-network/keys';
const { uint8array, varint, json } = utils;
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';
import makeDoc from '../../utils/makeDoc.js';
import signDoc from '../../utils/signDoc.js';
import verifyDoc from '../../utils/verifyDoc.js';
import { SignableMessage } from '@scintilla-network/keys';

class GovernanceVote {
    constructor(options = {}) {
        this.kind = 'GOVERNANCE_VOTE';
        this.version = 1;
        this.proposal = options.proposal || '';
        this.vote = options.vote || '';
        this.dao = options.dao || '';
        this.timestamp = options.timestamp || BigInt(Date.now());
        this.voter = options.voter || '';
        this.votingPower = options.votingPower || 0;
        this.authorizations = (options.authorizations || []).map(auth => new Authorization(auth));
    }

    toUint8Array(options = {}) {
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }
        if(options.excludeAuthorization === undefined) {
            options.excludeAuthorization = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['GOVERNANCE_VOTE'], 'uint8array');
        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');
        const timestampUint8Array = varint.encodeVarInt(this.timestamp, 'uint8array');

        // Proposal
        const proposalUint8Array = uint8array.fromString(this.proposal);
        const proposalLengthUint8Array = varint.encodeVarInt(proposalUint8Array.length, 'uint8array');

        // Vote
        const voteUint8Array = uint8array.fromString(this.vote);
        const voteLengthUint8Array = varint.encodeVarInt(voteUint8Array.length, 'uint8array');

        // DAO
        const daoUint8Array = uint8array.fromString(this.dao);
        const daoLengthUint8Array = varint.encodeVarInt(daoUint8Array.length, 'uint8array');

        // Voter
        const voterUint8Array = uint8array.fromString(this.voter);
        const voterLengthUint8Array = varint.encodeVarInt(voterUint8Array.length, 'uint8array');

        // Voting Power
        const votingPowerUint8Array = varint.encodeVarInt(this.votingPower, 'uint8array');


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
            + proposalLengthUint8Array.length + proposalUint8Array.length
            + voteLengthUint8Array.length + voteUint8Array.length
            + daoLengthUint8Array.length + daoUint8Array.length
            + voterLengthUint8Array.length + voterUint8Array.length
            + votingPowerUint8Array.length
            + (options.excludeAuthorization ? 0 : authorizationsLengthUint8Array.length + authorizationsUint8Array.length);

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
        if(options.excludeAuthorization === false) {
            result.set(authorizationsLengthUint8Array, offset); offset += authorizationsLengthUint8Array.length;
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }

        return result;
    }

    static fromUint8Array(inputArray) {
        const voteProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['GOVERNANCE_VOTE']) {
            throw new Error('Invalid element kind');
        }
        voteProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = varint.decodeVarInt(inputArray.subarray(offset));
        voteProps.version = version;
        offset += versionLength;

        const {value: timestamp, length: timestampBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        voteProps.timestamp = timestamp;
        offset += timestampBytes;

        // Proposal
        const {value: proposalLength, length: proposalLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += proposalLengthBytes;
        voteProps.proposal = uint8array.toString(inputArray.subarray(offset, offset + proposalLength));
        offset += proposalLength;

        // Vote
        const {value: voteLength, length: voteLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += voteLengthBytes;
        voteProps.vote = uint8array.toString(inputArray.subarray(offset, offset + voteLength));
        offset += voteLength;

        // DAO
        const {value: daoLength, length: daoLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += daoLengthBytes;
        voteProps.dao = uint8array.toString(inputArray.subarray(offset, offset + daoLength));
        offset += daoLength;

        // Voter
        const {value: voterLength, length: voterLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += voterLengthBytes;
        voteProps.voter = uint8array.toString(inputArray.subarray(offset, offset + voterLength));
        offset += voterLength;

        // Voting Power
        const {value: votingPower, length: votingPowerBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        voteProps.votingPower = votingPower;
        offset += votingPowerBytes;

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
        voteProps.authorizations = authorizations;

        return new GovernanceVote(voteProps);
    }

    toBuffer() {
        return this.toUint8Array();
    }

    static fromBuffer(buffer) {
        const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        return GovernanceVote.fromUint8Array(uint8Array);
    }

    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return GovernanceVote.fromUint8Array(uint8Array);
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
            proposal: this.proposal,
            vote: this.vote,
            dao: this.dao,
            voter: this.voter,
            votingPower: this.votingPower,
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

export { GovernanceVote };

export default GovernanceVote;

