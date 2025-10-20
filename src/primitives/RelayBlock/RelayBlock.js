import { RelayBlockHeader } from './RelayBlockHeader.js';
import {RelayBlockPayload} from "./RelayBlockPayload.js";
import { sha256 } from '@scintilla-network/hashes/classic';

import makeDoc from '../../utils/makeDoc.js';
import { SignableMessage } from '@scintilla-network/keys';
import { uint8array, varint } from '@scintilla-network/keys/utils';
import { NET_KINDS } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';

export class RelayBlock {
    constructor(options = {}) {
        this.kind = 'RELAYBLOCK';
        this.version = 1;
        this.header = new RelayBlockHeader(options.header);
        this.payload = new RelayBlockPayload(options.payload);
        this.authorizations = Authorization.fromAuthorizationsJSON({ authorizations: options.authorizations });
    }


    static fromUint8Array(inputArray) {
        let offset = 0;

        const {value: elementKind, length: elementKindBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindBytes;
        if(elementKind !== NET_KINDS['RELAYBLOCK']) {
            throw new Error(`Invalid element kind: ${elementKind}(${NET_KINDS_ARRAY[elementKind]}) - Expected: ${NET_KINDS['RELAYBLOCK']}(RELAYBLOCK)`);
        }
        const {value: version, length: versionBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += versionBytes;
        if(version !== 1) {
            throw new Error(`Invalid version: ${version} - Expected: 1`);
        }   

        const {value: headerLength, length: headerLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += headerLengthBytes;

        const headerUint8Array = inputArray.slice(offset, offset + headerLength);
        const header = RelayBlockHeader.fromUint8Array(headerUint8Array);
        offset += headerLength;

        const {value: payloadLength, length: payloadLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += payloadLengthBytes;

        const payloadUint8Array = inputArray.slice(offset, offset + payloadLength);
        const payload = RelayBlockPayload.fromUint8Array(payloadUint8Array);
        offset += payloadLength;

        // Authorizations
        const authorizations = Authorization.fromAuthorizationsUint8Array(inputArray.subarray(offset));

        return new RelayBlock({
            header: header.toJSON(),
            payload: payload.toJSON(),
            authorizations,
        });
    }

    static fromJSON(json) {
        const instance = new RelayBlock({
            ...json,
            header: RelayBlockHeader.fromJSON(json.header),
            payload: RelayBlockPayload.fromJSON(json.payload),
        });
        return instance;
    }


    toUint8Array(options = {}) {
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['RELAYBLOCK'], 'uint8array');
        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');

        const headerUint8Array = this.header.toUint8Array();
        const headerLengthUint8Array = varint.encodeVarInt(headerUint8Array.length, 'uint8array');

        const payloadUint8Array = this.payload.toUint8Array();
        const payloadLengthUint8Array = varint.encodeVarInt(payloadUint8Array.length, 'uint8array');

        let authorizationsUint8Array = new Uint8Array();
        if(options.excludeAuthorizations === false) {
            authorizationsUint8Array = Authorization.toAuthorizationsUint8Array(this.authorizations);
        }

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + headerLengthUint8Array.length + headerUint8Array.length 
        + payloadLengthUint8Array.length + payloadUint8Array.length 
        + (options.excludeAuthorizations === true ? 0 : authorizationsUint8Array.length);

        const result = new Uint8Array(totalLength);

        let offset = 0;
        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(headerLengthUint8Array, offset); offset += headerLengthUint8Array.length;
        result.set(headerUint8Array, offset); offset += headerUint8Array.length;
        result.set(payloadLengthUint8Array, offset); offset += payloadLengthUint8Array.length;
        result.set(payloadUint8Array, offset); offset += payloadUint8Array.length;
        if(options.excludeAuthorizations !== true) {
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }
        return result;
    }


    considerStateAction(stateAction) {
        if(!stateAction){
            console.error(`Relay Block tied to consider an undefined staction`);
            return;
        }
        this.payload.considerStateAction(stateAction);
        // This changes the timestamp of the block forwards (we let the ability to set to propose time, but if not, we update each time we add a state action)
        const timeNow = BigInt(Date.now());
        const timeHeader = this.header.timestamp;
        // But we know the block is valid for 10 minutes max, so we can't go forward more than that
        if(timeNow > timeHeader && timeNow < timeHeader + 10000n * 60n){
            this.header.timestamp = timeNow;
        }
    }

    considerCluster(clusterMoniker, clusterHash) {
        if (!clusterHash || !clusterMoniker) {
            console.error('RelayBlock tried to consider an undefined element.');
            return;
        }
        this.payload.considerCluster(clusterMoniker, clusterHash);
    }

    addAuthorization(authorization) {
        if(authorization.signature === '' || authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.push(authorization);
    }


    toSignableMessage({excludeAuthorizations = false} = {}) {
        return new SignableMessage(this.toHex({excludeAuthorizations: excludeAuthorizations}));
    }

    verifyAuthorizations() {
        return this.authorizations.every(auth => auth.verify(this).valid);
    }


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
    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return RelayBlock.fromUint8Array(uint8Array);
    }

    toJSON({excludeAuthorizations = false} = {}) {
        const obj = {
            kind: this.kind,
            version: this.version,
            header: this.header.toJSON(),
            payload: this.payload.toJSON(),
        };

        if (excludeAuthorizations === false) {
            obj['authorizations'] = Authorization.toAuthorizationsJSON(this.authorizations);
        }

        return obj;
    }

    toHash(encoding = 'uint8array', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    toDoc(signer){
        return makeDoc(this, signer);   
    }

    validate() {
        if (!this.authorizations) return {valid: false, error: 'Authorizations are required.'};

        const signedAuthorizations = this.authorizations.filter(authorization => authorization.signature);
        if (!signedAuthorizations.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedAuthorizations.filter(authorization => authorization.publicKey);
        if(authWithPublicKey.length < 0) return {valid: false, error: 'At least one authorization with public key is required.'};

        // proposer has signed the block
        const proposerAuthorization = this.authorizations.find(authorization => authorization.moniker === this.header.proposer);
        if(!proposerAuthorization) return {valid: false, error: 'Proposer authorization is required.'};

        if (!this.verifyAuthorizations()) return {valid: false,error: 'Invalid authorization.'};
        return {valid: true, error: ''};
    }

    isValid() {
        const {valid} = this.validate();
        return valid;
    }
}

export default RelayBlock;
