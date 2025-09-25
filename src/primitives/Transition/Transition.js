// src/primitives/Transition/Transition.js
// import { sha256 } from "../../utils/hash.js";
import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
import makeDoc from "../../utils/makeDoc.js";
import { SignableMessage, utils } from "@scintilla-network/keys";
const { uint8array, json, varint } = utils;
import signDoc from "../../utils/signDoc.js";
import verifyDoc from "../../utils/verifyDoc.js";
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';
// import uInt8ArrayToHex from "../../utils/uInt8ArrayToHex.js";

export class Transition {
    constructor(props = {}) {
        this.version = 1;
        this.kind = 'TRANSITION';

        this.cluster = props.cluster || null;
        this.action = props.action || null;
        this.type = props.type || null;
        this.data = props.data || {};
        this.timestamp = props.timestamp || Date.now();

        this.authorizations = props.authorizations || [];
        this.fees = props.fees || [];
        this.version = props.version || 1;

        this.timelock = props.timelock;

        this.authorizations = this.authorizations.map(authorization => {
            return new Authorization(authorization);
        });
    }

    computeHash() {
        const stringified = json.sortedJsonByKeyStringify(this);
        const dataUint8Array = uint8array.fromString(stringified);
        const hash = sha256(dataUint8Array);
        return uint8array.toHex(hash);
    }

    toUint8Array(options = {}) {
        if(options.excludeAuthorization === undefined) {
            options.excludeAuthorization = false;
        }
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS[this.kind], 'uint8array');
        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');

        const clusterUint8Array = uint8array.fromString(this.cluster || '');
        const clusterLengthUint8Array = varint.encodeVarInt(clusterUint8Array.length, 'uint8array');

        const actionUint8Array = uint8array.fromString(this.action || '');
        const actionLengthUint8Array = varint.encodeVarInt(actionUint8Array.length, 'uint8array');
        
        const typeUint8Array = uint8array.fromString(this.type || '');
        const typeLengthUint8Array = varint.encodeVarInt(typeUint8Array.length, 'uint8array');
        
        // Data is an object, serialize as JSON string
        const dataString = JSON.stringify(this.data);
        const dataUint8Array = uint8array.fromString(dataString);
        const dataLengthUint8Array = varint.encodeVarInt(dataUint8Array.length, 'uint8array');

        const timestampUint8Array = varint.encodeVarInt(this.timestamp, 'uint8array');

        const feesLengthUint8Array = varint.encodeVarInt(this.fees.length, 'uint8array');
        const feesUint8Array = [];
        this.fees.forEach(fee => {
            const feeString = JSON.stringify(fee);
            const feeLengthUint8Array = varint.encodeVarInt(feeString.length, 'uint8array');
            const feeUint8Array = uint8array.fromString(feeString);
            feesUint8Array.push(...feeLengthUint8Array, ...feeUint8Array);
        });

        const authorizationsLengthUint8Array = varint.encodeVarInt(this.authorizations.length, 'uint8array');
        const authorizationsUint8Array = [];
        this.authorizations.forEach(authorization => {
            const authorizationUint8Array = authorization.toUint8Array();
            authorizationsUint8Array.push(...authorizationUint8Array);
        });

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + clusterLengthUint8Array.length + clusterUint8Array.length 
        + actionLengthUint8Array.length + actionUint8Array.length 
        + typeLengthUint8Array.length + typeUint8Array.length 
        + dataLengthUint8Array.length + dataUint8Array.length 
        + timestampUint8Array.length
        + feesLengthUint8Array.length + feesUint8Array.length 
        + (options.excludeAuthorization ? 0 : authorizationsLengthUint8Array.length + authorizationsUint8Array.length);

        const result = new Uint8Array(totalLength);
        let offset = 0;
        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(clusterLengthUint8Array, offset); offset += clusterLengthUint8Array.length;
        result.set(clusterUint8Array, offset); offset += clusterUint8Array.length;
        result.set(actionLengthUint8Array, offset); offset += actionLengthUint8Array.length;
        result.set(actionUint8Array, offset); offset += actionUint8Array.length;
        result.set(typeLengthUint8Array, offset); offset += typeLengthUint8Array.length;
        result.set(typeUint8Array, offset); offset += typeUint8Array.length;
        result.set(dataLengthUint8Array, offset); offset += dataLengthUint8Array.length;
        result.set(dataUint8Array, offset); offset += dataUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;
        result.set(feesLengthUint8Array, offset); offset += feesLengthUint8Array.length;
        result.set(feesUint8Array, offset); offset += feesUint8Array.length;
        if(options.excludeAuthorization === false) {
            result.set(authorizationsLengthUint8Array, offset); offset += authorizationsLengthUint8Array.length;
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }
        return result;
    }

    static fromUint8Array(inputArray) {
        const transitionProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['TRANSITION']) {
            throw new Error('Invalid element kind');
        }
        transitionProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = varint.decodeVarInt(inputArray.subarray(offset));
        transitionProps.version = version;
        offset += versionLength;

        // Cluster
        const {value: clusterLength, length: clusterLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += clusterLengthBytes;
        transitionProps.cluster = uint8array.toString(inputArray.subarray(offset, offset + clusterLength));
        offset += clusterLength;

        // Action
        const {value: actionLength, length: actionLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += actionLengthBytes;
        transitionProps.action = uint8array.toString(inputArray.subarray(offset, offset + actionLength));
        offset += actionLength;

        // Type
        const {value: typeLength, length: typeLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += typeLengthBytes;
        transitionProps.type = uint8array.toString(inputArray.subarray(offset, offset + typeLength));
        offset += typeLength;

        // Data
        const {value: dataLength, length: dataLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += dataLengthBytes;
        const dataString = uint8array.toString(inputArray.subarray(offset, offset + dataLength));
        transitionProps.data = JSON.parse(dataString);
        offset += dataLength;

        // Timestamp
        const {value: timestamp, length: timestampBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        transitionProps.timestamp = timestamp;
        offset += timestampBytes;

        // Fees
        const {value: feesLength, length: feesLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += feesLengthBytes;
        transitionProps.fees = [];
        for (let i = 0; i < feesLength; i++) {
            const {value: feeLength, length: feeLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
            offset += feeLengthBytes;
            const feeString = uint8array.toString(inputArray.subarray(offset, offset + feeLength));
            offset += feeLength;
            transitionProps.fees.push(JSON.parse(feeString));
        }

        // Authorizations
        const {value: authorizationsLength, length: authorizationsLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += authorizationsLengthBytes;
        transitionProps.authorizations = [];
        for (let i = 0; i < authorizationsLength; i++) {
            const authorization = Authorization.fromUint8Array(inputArray.subarray(offset));
            const authorizationBytes = authorization.toUint8Array();
            offset += authorizationBytes.length;
            transitionProps.authorizations.push(authorization);
        }

        return new Transition(transitionProps);
    }

    toBuffer({excludeAuthorization = false} = {}) {
        return this.toUint8Array({excludeAuthorization});
    }

    static fromBuffer(buffer) {
        const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        return Transition.fromUint8Array(uint8Array);
    }

    toHex({excludeAuthorization = false} = {}) {
        return uint8array.toHex(this.toBuffer({excludeAuthorization}));
    }

    toUInt8Array({excludeAuthorization = false} = {}) {
        return this.toUint8Array({excludeAuthorization});
    }

    toHash(encoding = 'hex', {excludeAuthorization = true} = {}) {
        const uint8Array = this.toUint8Array({ excludeAuthorization });
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hashUint8Array) : uint8array.toString(hashUint8Array);
    }

    toJSON({excludeAuthorization = false} = {}) {
        const obj = {
            version: this.version,
            kind: this.kind,
            cluster: this.cluster,
            action: this.action,
            type: this.type,
            data: this.data,
            timestamp: this.timestamp,
            fees: this.fees,
        };

        if (!excludeAuthorization) {
            obj['authorizations'] = this.authorizations.map(authorization => {
                const authorizationObj = {
                    ...authorization,
                };
                if(authorization.signature) {
                    authorizationObj.signature = uint8array.toHex(authorization.signature);
                }
                if(authorization.publicKey) {
                    authorizationObj.publicKey = uint8array.toHex(authorization.publicKey);
                }
                return authorizationObj;
            });
        }
        return obj;
    }

    addAuthorization(authorization) {
        if(authorization.signature === '' || authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        // If its hex, convert it to uint8array
        if(typeof authorization.signature === 'string'){
            authorization.signature = uint8array.fromHex(authorization.signature);
        }
        if(typeof authorization.publicKey === 'string'){
            authorization.publicKey = uint8array.fromHex(authorization.publicKey);
        }
        this.authorizations.push(authorization);
    }

    verifySignature() {
       return verifyDoc(this);
    }
    
    toBase64() {
        const uint8Array = this.toUint8Array();
        return btoa(String.fromCharCode(...uint8Array));
    }

    toSignableMessage() {
        return new SignableMessage(this.toHash());
    }

    toDoc(signer) {
        return makeDoc(this, signer);
    }

    async sign(signer) {
        return signDoc(await this.toDoc(signer));
    }

    getPublicKey() {
        return this.authorizations?.[0]?.publicKey;
    }

    validate() {
        if (!this.authorizations) return {valid: false, error: 'Authorizations are required.'};

        const signedAuthorizations = this.authorizations.filter(authorization => authorization.signature);
        if (!signedAuthorizations.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedAuthorizations.filter(authorization => authorization.publicKey);
        if(authWithPublicKey.length < 0) return {valid: false, error: 'At least one authorization with public key is required.'};

        if (!this.verifySignature()) return {valid: false,error: 'Invalid signature.'};
        return {valid: true, error: ''};
    }

    isValid() {
        const {valid, error} = this.validate();
        if(!valid){
            console.error('error validating transition', error);
        }
        return valid;
    }

    isValidAtTick(currentTick) {
        if (!this.timelock) return true;
        return currentTick >= this.timelock.startTick && currentTick <= this.timelock.endTick;
    }
}

export default Transition;
