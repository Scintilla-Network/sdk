import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
import { SignableMessage } from '@scintilla-network/keys';
import { varint, uint8array, json, varbigint } from '@scintilla-network/keys/utils';
import makeDoc from "../../utils/makeDoc.js";
import signDoc from "../../utils/signDoc.js";
import verifyDoc from "../../utils/verifyDoc.js";
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
// import uInt8ArrayToHex from "../../utils/uInt8ArrayToHex.js";
import { StateActionData } from '../StateActionData/StateActionData.js';
import { Authorizations } from '../Authorizations/Authorizations.js';
import { Authorization } from '../Authorization/Authorization.js';

export class Transfer {
    constructor(props = {}) {
        this.version = 1;
        this.kind = 'TRANSFER';

        this.cluster = props.cluster || null;
        this.action = props.action || null;
        this.type = props.type || null;
        this.data = new StateActionData(props.data);
        this.timestamp = props.timestamp || BigInt(Date.now());

        this.authorizations = new Authorizations(props.authorizations);
        this.fees = props.fees || [];
        this.version = props.version || 1;

        this.timelock = props.timelock ?? {startTick: 0n, endTick: 0n};
    }

    toUint8Array(options = {}) {
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['TRANSFER'], 'uint8array');
        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');

        const clusterUint8Array = uint8array.fromString(this.cluster);
        const clusterLengthUint8Array = varint.encodeVarInt(clusterUint8Array.length, 'uint8array');

        const timestampUint8Array = varbigint.encodeVarBigInt(this.timestamp, 'uint8array');

        const actionUint8Array = uint8array.fromString(this.action);
        const actionLengthUint8Array = varint.encodeVarInt(actionUint8Array.length, 'uint8array');
        
        const typeUint8Array = uint8array.fromString(this.type);
        const typeLengthUint8Array = varint.encodeVarInt(typeUint8Array.length, 'uint8array');

        const dataUint8Array = this.data.toUint8Array();
        const dataTotalLengthUint8Array = varint.encodeVarInt(dataUint8Array.length, 'uint8array');

        const feesLengthUint8Array = varint.encodeVarInt(this.fees.length, 'uint8array');
        const feesUint8Array = [];
        this.fees.forEach(fee => {
            const feeString = JSON.stringify(fee);
            const feeLengthUint8Array = varint.encodeVarInt(feeString.length, 'uint8array');
            const feeUint8Array = uint8array.fromString(feeString);
            feesUint8Array.push(...feeLengthUint8Array, ...feeUint8Array);
        });

        const timelockStartTickUint8Array = varbigint.encodeVarBigInt(BigInt(this.timelock.startTick), 'uint8array');
        const timelockEndTickUint8Array = varbigint.encodeVarBigInt(BigInt(this.timelock.endTick), 'uint8array');

        const authorizationsUint8Array = this.authorizations.toUint8Array();
        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + clusterLengthUint8Array.length + clusterUint8Array.length 
        + timestampUint8Array.length
        + actionLengthUint8Array.length + actionUint8Array.length 
        + typeLengthUint8Array.length + typeUint8Array.length 
        + dataTotalLengthUint8Array.length + dataUint8Array.length 
        + feesLengthUint8Array.length + feesUint8Array.length 
        + timelockStartTickUint8Array.length + timelockEndTickUint8Array.length
        + (options.excludeAuthorizations ? 0 : authorizationsUint8Array.length);

        const result = new Uint8Array(totalLength);
        let offset = 0;
        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(clusterLengthUint8Array, offset); offset += clusterLengthUint8Array.length;
        result.set(clusterUint8Array, offset); offset += clusterUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;
        result.set(actionLengthUint8Array, offset); offset += actionLengthUint8Array.length;
        result.set(actionUint8Array, offset); offset += actionUint8Array.length;
        result.set(typeLengthUint8Array, offset); offset += typeLengthUint8Array.length;
        result.set(typeUint8Array, offset); offset += typeUint8Array.length;
        result.set(dataTotalLengthUint8Array, offset); offset += dataTotalLengthUint8Array.length;
        result.set(dataUint8Array, offset); offset += dataUint8Array.length;
        result.set(feesLengthUint8Array, offset); offset += feesLengthUint8Array.length;
        result.set(feesUint8Array, offset); offset += feesUint8Array.length;
        result.set(timelockStartTickUint8Array, offset); offset += timelockStartTickUint8Array.length;
        result.set(timelockEndTickUint8Array, offset); offset += timelockEndTickUint8Array.length;
        console.log({
            result
        });
        if(options.excludeAuthorizations === false) {
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }
        console.log({
            options
        });
        console.log(`| - Transfer.toUint8Array(): END [Length: ${result.length}]`);
        console.log({
            result,
        })
        return result;
    }

    static fromUint8Array(inputArray) {
        console.log(`| - Transfer.fromUint8Array() : START [Length: ${inputArray.length}]`);
        console.log({
            inputArray: inputArray,
        });
        const transferProps = {};

        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['TRANSFER']) {
            throw new Error('Invalid element kind');
        }
        transferProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = varint.decodeVarInt(inputArray.subarray(offset));
        transferProps.version = version;
        offset += versionLength;

        // Cluster
        const {value: clusterLength, length: clusterLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += clusterLengthBytes;
        transferProps.cluster = uint8array.toString(inputArray.subarray(offset, offset + clusterLength));
        offset += clusterLength;

        // Timestamp
        const {value: timestamp, length: timestampBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        transferProps.timestamp = timestamp;
        offset += timestampBytes;
     
        // Action
        const {value: actionLength, length: actionLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += actionLengthBytes;
        transferProps.action = uint8array.toString(inputArray.subarray(offset, offset + actionLength));
        offset += actionLength;

        // Type
        const {value: typeLength, length: typeLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += typeLengthBytes;
        transferProps.type = uint8array.toString(inputArray.subarray(offset, offset + typeLength));
        offset += typeLength;

        // Data
        const {value: dataTotalLength, length: dataTotalLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += dataTotalLengthBytes;
        transferProps.data = StateActionData.fromUint8Array(inputArray.subarray(offset, offset + dataTotalLength));
        offset += dataTotalLength;

        // Fees
        const {value: feesLength, length: feesLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += feesLengthBytes;
        transferProps.fees = [];
        for (let i = 0; i < feesLength; i++) {
            const {value: feeLength, length: feeLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
            offset += feeLengthBytes;
            const feeString = uint8array.toString(inputArray.subarray(offset, offset + feeLength));
            offset += feeLength;
            transferProps.fees.push(JSON.parse(feeString));
        }

        // Timelock
        const {value: timelockStartTick, length: timelockStartTickBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        const {value: timelockEndTick, length: timelockEndTickBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        transferProps.timelock = {startTick: timelockStartTick, endTick: timelockEndTick};
        offset += timelockStartTickBytes + timelockEndTickBytes;
        

        // Authorizations
        // const {value: authorizationsLength, length: authorizationsLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        // offset += authorizationsLengthBytes;
        transferProps.authorizations = Authorizations.fromUint8Array(inputArray.subarray(offset));
        offset += transferProps.authorizations.toUint8Array().length;
        console.log(`| - Transfer.fromUint8Array(): END [Length: ${inputArray.length}]`);

        return new Transfer(transferProps);
    }

    computeHash() {
        const stringified = json.sortedJsonByKeyStringify(this);
        const dataAsUint8Array = uint8array.fromString(stringified);
        const hash = sha256(dataAsUint8Array);
        return uint8array.toHex(hash);
    }

    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }

    toHash(encoding = 'hex', {excludeAuthorizations = true} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hashUint8Array) : uint8array.toString(hashUint8Array);
    }

    toJSON({excludeAuthorizations = false} = {}) {
        const obj = {
            version: this.version,
            kind: this.kind,
            cluster: this.cluster,
            action: this.action,
            type: this.type,
            data: this.data.toJSON(),
            timestamp: this.timestamp,
            fees: this.fees,
        };

        if (!excludeAuthorizations) {
            obj['authorizations'] = this.authorizations.authorizations.map(authorization => {
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

    verifyAuthorization() {
        return this.authorizations.verify(this);
    }

    getPublicKey() {
        return this.authorizations.authorizations?.[0]?.publicKey;
    }

    toBase64() {
        const uint8Array = this.toUint8Array();
        return btoa(String.fromCharCode(...uint8Array));
    }

    addAuthorization(authorization) {
        if (authorization.signature === '' || authorization.signature === undefined) {
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.addAuthorization(authorization);
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

    validate() {
        if (!this.authorizations) return {valid: false, error: 'Authorizations are required.'};

        const signedAuthorizations = this.authorizations.authorizations.filter(authorization => authorization.signature);
        if (!signedAuthorizations.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedAuthorizations.filter(authorization => authorization.publicKey);
        if(authWithPublicKey.length < 0) return {valid: false, error: 'At least one authorization with public key is required.'};

        if (!this.verifyAuthorization()) return {valid: false,error: 'Invalid signature.'};
        return {valid: true, error: ''};
    }

    isValid() {
        const {valid} = this.validate();
        return valid;
    }

    isValidAtTick(currentTick) {
        if (!this.timelock) return true;
        return currentTick >= this.timelock.startTick && currentTick <= this.timelock.endTick;
    }
}

export default Transfer;

