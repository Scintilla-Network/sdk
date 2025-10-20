import {  uint8array, varint, json } from '@scintilla-network/keys/utils';
import { sha256 } from '@scintilla-network/hashes/classic';
import { SignableMessage } from '@scintilla-network/keys';

import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';
import makeDoc from '../../utils/makeDoc.js';

class GovernanceVote {
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

    static fromJSON(json) {
        return new GovernanceVote({
            ...json,
        });
    }

    static fromUint8Array(inputArray) {
        const voteProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['GOVERNANCEVOTE']) {
            throw new Error(`Invalid element kind: ${elementKind}(${NET_KINDS_ARRAY[elementKind]}) - Expected: ${NET_KINDS['GOVERNANCEVOTE']}(GOVERNANCEVOTE)`);
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
        voteProps.authorizations = Authorization.fromAuthorizationsUint8Array(inputArray.subarray(offset));

        return new GovernanceVote(voteProps);
    }


    static fromBuffer(buffer) {
        const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        return GovernanceVote.fromUint8Array(uint8Array);
    }


    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return GovernanceVote.fromUint8Array(uint8Array);
    }

    toUint8Array(options = {}) {
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }

        const kind = NET_KINDS[this.kind];
        const elementKindUint8Array = varint.encodeVarInt(kind, 'uint8array');
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

    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }

    toHash(encoding = 'uint8array', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    addAuthorization(authorization) {
        authorization = new Authorization(authorization);
        if(authorization.signature === '' || authorization.signature === undefined){
            console.error('RelayBlock tried to add an empty authorization.');
            console.error(authorization);
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.addAuthorization(authorization);
    }

    verifySignature() {
        return this.authorizations.verify(this);
    }

    toSignableMessage({excludeAuthorizations = false} = {}) {
        return new SignableMessage(this.toHex({excludeAuthorizations}));
    }

    toDoc(signer) {
        return makeDoc(this, signer);
    }

    async sign(signer) {
        this.authorizations.sign(this, signer);
        return this;
        // return signDoc(await this.toDoc(signer));
    }

    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }

    validate() {
        if (!this.authorizations || this.authorizations.authorizations.length === 0) {
            return {valid: false, error: 'Authorizations are required.'};
        }

        const signedAuthorizations = this.authorizations.authorizations.filter(auth => auth.signature);
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
        return valid;
    }

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

