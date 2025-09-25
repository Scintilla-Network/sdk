import { RelayBlockHeader } from './RelayBlockHeader.js';
import {RelayBlockPayload} from "./RelayBlockPayload.js";
// import {sha256} from "../../utils/hash.js";
import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;

import signDoc from '../../utils/signDoc.js';
import makeDoc from '../../utils/makeDoc.js';
import verifyDoc from '../../utils/verifyDoc.js';
import { SignableMessage } from '@scintilla-network/keys';
import { uint8array, varint, json } from '@scintilla-network/keys/utils';
import { NET_KINDS } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';

export class RelayBlock {
    constructor(options = {}) {
        this.kind = 'RELAYBLOCK';
        this.version = 1;
        this.header = new RelayBlockHeader(options.header);
        this.payload = new RelayBlockPayload(options.payload);
        this.authorizations = options.authorizations || [];
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
        const authorizations = authorizationsUint8Array.map(authorization => Authorization.fromUint8Array(authorization));
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
        if(options.excludeAuthorization === undefined) {
            options.excludeAuthorization = false;
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
        
        const authorizationsUint8Array = this.authorizations.map(authorization => authorization.toUint8Array());
        const authorizationsLengthUint8Array = varint.encodeVarInt(authorizationsUint8Array.length, 'uint8array');
        
        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + headerLengthUint8Array.length + headerUint8Array.length 
        + payloadLengthUint8Array.length + payloadUint8Array.length 
        + authorizationsLengthUint8Array.length + authorizationsUint8Array.length;
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
        if(options.excludeAuthorization === false) {
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

    addSignature(signature) {
        if(signature.signature === '' || signature.signature === undefined){
            console.error('RelayBlock tried to add an empty signature.');
            console.error(signature);
            throw new Error('Signature is required for authorization.');
        }
        this.signatures.push(signature);
    }

    toSignableMessage({excludeAuthorization = false} = {}) {
        return new SignableMessage(this.toHex({excludeSignatures: excludeAuthorization}));
    }

    verifySignature() {
        return verifyDoc(this);
    }


    addAuthorization(authorization) {
        if(authorization.signature === '' || authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        this.signatures.push(authorization);
    }

    async sign(signer) {
        const doc = await this.toDoc(signer);
        const hash = this.toHash('hex');
        return signDoc(doc, hash);
    }

    toBuffer({excludeSignatures = false} = {}) {
        const headerUint8Array = this.header.toUint8Array();
        const dataUint8Array = this.payload.toUint8Array();

        const headerLengthUint8Array = new Uint8Array(4);
        const headerLengthView = new DataView(headerLengthUint8Array.buffer);
        headerLengthView.setInt32(0, headerUint8Array.length, false);

        const dataLengthUint8Array = new Uint8Array(4);
        const dataLengthView = new DataView(dataLengthUint8Array.buffer);
        dataLengthView.setInt32(0, dataUint8Array.length, false);

        if(!excludeSignatures){
            const signaturesUint8Array = uint8array.fromString(json.stringify(this.authorizations));
            const signaturesLengthUint8Array = new Uint8Array(4);
            const signaturesLengthView = new DataView(signaturesLengthUint8Array.buffer);
            signaturesLengthView.setInt32(0, signaturesUint8Array.length, false);
            
            const result = new Uint8Array(headerLengthUint8Array.length + headerUint8Array.length + dataLengthUint8Array.length + dataUint8Array.length + signaturesLengthUint8Array.length + signaturesUint8Array.length);
            let offset = 0;
            result.set(headerLengthUint8Array, offset); offset += headerLengthUint8Array.length;
            result.set(headerUint8Array, offset); offset += headerUint8Array.length;
            result.set(dataLengthUint8Array, offset); offset += dataLengthUint8Array.length;
            result.set(dataUint8Array, offset); offset += dataUint8Array.length;
            result.set(signaturesLengthUint8Array, offset); offset += signaturesLengthUint8Array.length;
            result.set(signaturesUint8Array, offset);
            return result;
        }

        const result = new Uint8Array(headerLengthUint8Array.length + headerUint8Array.length + dataLengthUint8Array.length + dataUint8Array.length);
        let offset = 0;
        result.set(headerLengthUint8Array, offset); offset += headerLengthUint8Array.length;
        result.set(headerUint8Array, offset); offset += headerUint8Array.length;
        result.set(dataLengthUint8Array, offset); offset += dataLengthUint8Array.length;
        result.set(dataUint8Array, offset);
        return result;
    }

    toHex({excludeSignatures = false} = {}) {
        return uint8array.toHex(this.toBuffer({excludeSignatures}));
    }

    static fromBuffer(buffer) {
        const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        let offset = 0;

        const headerLengthView = new DataView(uint8Array.buffer, uint8Array.byteOffset + offset, 4);
        const headerLength = headerLengthView.getInt32(0, false);
        offset += 4;
        
        const headerUint8Array = uint8Array.slice(offset, offset + headerLength);
        const header = RelayBlockHeader.fromUint8Array(headerUint8Array);
        offset += headerLength;

        const dataLengthView = new DataView(uint8Array.buffer, uint8Array.byteOffset + offset, 4);
        const dataLength = dataLengthView.getInt32(0, false);
        offset += 4;
        
        const dataUint8Array = uint8Array.slice(offset, offset + dataLength);
        const payload = RelayBlockPayload.fromUint8Array(dataUint8Array);
        offset += dataLength;

        let signatures = [];
        if (offset < uint8Array.length) {
            const signaturesLengthView = new DataView(uint8Array.buffer, uint8Array.byteOffset + offset, 4);
            const signaturesLength = signaturesLengthView.getInt32(0, false);
            offset += 4;

            if (signaturesLength > 0) {
                const signaturesUint8Array = uint8Array.slice(offset, offset + signaturesLength);
                signatures = JSON.parse(uint8array.toString(signaturesUint8Array));
            }
        }

        return new RelayBlock({
            header: header.toJSON(),
            payload: payload.toJSON(),
            signatures,
        });
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return RelayBlock.fromBuffer(uint8Array);
    }

    toJSON({excludeSignatures = false} = {}) {
        const obj = {
            header: this.header.toJSON(),
            payload: this.payload.toJSON(),
        };

        if (!excludeSignatures) {
            obj['signatures'] = this.signatures;
        }

        return obj;
    }

    toHash(encoding = 'hex', {excludeSignatures = true} = {}) {
        const uint8Array = this.toBuffer({excludeSignatures});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hashUint8Array) : uint8array.toString(hashUint8Array);
    }

    toDoc(signer){
        return makeDoc(this, signer);   
    }

    validate() {
        if (!this.signatures) return {valid: false, error: 'Signatures are required.'};

        const signedSignatures = this.signatures.filter(signature => signature.signature);
        if (!signedSignatures.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedSignatures.filter(signature => signature.publicKey);
        if(authWithPublicKey.length < 0) return {valid: false, error: 'At least one authorization with public key is required.'};

        // proposer has signed the block
        const proposerSignature = this.signatures.find(signature => signature.moniker === this.header.proposer);
        if(!proposerSignature) return {valid: false, error: 'Proposer signature is required.'};

        if (!this.verifySignature()) return {valid: false,error: 'Invalid signature.'};
        return {valid: true, error: ''};
    }

    isValid() {
        const {valid} = this.validate();
        return valid;
    }
}

export default RelayBlock;
