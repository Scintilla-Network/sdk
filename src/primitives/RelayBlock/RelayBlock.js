import { RelayBlockHeader } from './RelayBlockHeader.js';
import {RelayBlockPayload} from "./RelayBlockPayload.js";
import { sha256 } from '@scintilla-network/hashes/classic';

import makeDoc from '../../utils/makeDoc.js';
import { SignableMessage } from '@scintilla-network/keys';
import { uint8array, varint } from '@scintilla-network/keys/utils';
import { NET_KINDS } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';
import { Authorizations } from '../Authorizations/Authorizations.js';

export class RelayBlock {
    constructor(options = {}) {
        this.kind = 'RELAYBLOCK';
        this.version = 1;
        this.header = new RelayBlockHeader(options.header);
        this.payload = new RelayBlockPayload(options.payload);
        this.authorizations = new Authorizations(options.authorizations);
    }


    static fromUint8Array(inputArray) {
        let offset = 0;

        const {value: elementKind, length: elementKindBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindBytes;
        if(elementKind !== NET_KINDS['RELAYBLOCK']) {
            throw new Error('Invalid element kind');
        }

        const {value: version, length: versionBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += versionBytes;
        if(version !== 1) {
            throw new Error('Invalid version');
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

        const {value: authorizationsLength, length: authorizationsLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += authorizationsLengthBytes;

        const authorizationsUint8Array = inputArray.slice(offset, offset + authorizationsLength);
        const authorizations = Authorizations.fromUint8Array(authorizationsUint8Array);
        offset += authorizationsLength;

        return new RelayBlock({
            header: header.toJSON(),
            payload: payload.toJSON(),
            authorizations,
        });

        // const header = RelayBlockHeader.fromUint8Array(uint8Array.slice(0, 4 + 8 + 32 + 4 + 32));
        // const payload = RelayBlockPayload.fromUint8Array(uint8Array.slice(4 + 8 + 32 + 4 + 32, uint8Array.length));
        // return new RelayBlock({
        //     header: header.toJSON(),
        //     payload: payload.toJSON(),
        // });
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
        
        // let authorizationsUint8Array = new Uint8Array();
        // for(let i = 0; i < this.authorizations.length; i++) {
        //     const authorizationUint8Array = this.authorizations[i].toUint8Array();
        //     authorizationsUint8Array = new Uint8Array([...authorizationsUint8Array, ...authorizationUint8Array]);
        // }

        // const authorizationsLengthUint8Array = varint.encodeVarInt(authorizationsUint8Array.length, 'uint8array');
        const authorizationsUint8Array = this.authorizations.toUint8Array();
        const authorizationsLengthUint8Array = varint.encodeVarInt(authorizationsUint8Array.length, 'uint8array');
        
        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + headerLengthUint8Array.length + headerUint8Array.length 
        + payloadLengthUint8Array.length + payloadUint8Array.length 
        + (options.excludeAuthorizations === true ? 0 : authorizationsLengthUint8Array.length + authorizationsUint8Array.length);
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
            result.set(authorizationsLengthUint8Array, offset); offset += authorizationsLengthUint8Array.length;
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
        const timeNow = Date.now();
        const timeHeader = this.header.timestamp.getTime();
        // But we know the block is valid for 10 minutes max, so we can't go forward more than that
        if(timeNow > timeHeader && timeNow < timeHeader + 10000 * 60){
            this.header.timestamp = new Date(timeNow);
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
        authorization = new Authorization(authorization);
        if(authorization.signature === '' || authorization.signature === undefined){
            console.error('RelayBlock tried to add an empty authorization.');
            throw new Error('Authorization is required for authorization.');
        }
        this.authorizations.addAuthorization(authorization);
    }

    toSignableMessage({excludeAuthorizations = false} = {}) {
        return new SignableMessage(this.toHex({excludeAuthorizations: excludeAuthorizations}));
    }

    verifyAuthorization() {
        return this.authorizations.verify(this);
    }


    sign(signer) {
        this.authorizations.sign(this, signer);
        return this;
    }
    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return RelayBlock.fromUint8Array(uint8Array);
    }

    toJSON({excludeAuthorizations = true} = {}) {
        const obj = {
            header: this.header.toJSON(),
            payload: this.payload.toJSON(),
        };

        if (!excludeAuthorizations) {
            obj['authorizations'] = this.authorizations.toJSON();
        }

        return obj;
    }

    toHash(encoding = 'hex', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hashUint8Array) : uint8array.toString(hashUint8Array);
    }

    toDoc(signer){
        return makeDoc(this, signer);   
    }

    validate() {
        if (!this.authorizations) return {valid: false, error: 'Authorizations are required.'};

        const signedAuthorizations = this.authorizations.authorizations.filter(authorization => authorization.signature);
        if (!signedAuthorizations.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedAuthorizations.filter(authorization => authorization.publicKey);
        if(authWithPublicKey.length < 0) return {valid: false, error: 'At least one authorization with public key is required.'};

        // proposer has signed the block
        const proposerAuthorization = this.authorizations.authorizations.find(authorization => authorization.moniker === this.header.proposer);
        if(!proposerAuthorization) return {valid: false, error: 'Proposer authorization is required.'};

        if (!this.verifyAuthorization()) return {valid: false,error: 'Invalid authorization.'};
        return {valid: true, error: ''};
    }

    isValid() {
        const {valid} = this.validate();
        return valid;
    }
}

export default RelayBlock;
