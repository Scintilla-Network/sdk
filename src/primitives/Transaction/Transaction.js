import { sha256 } from '@scintilla-network/hashes/classic';
import { SignableMessage } from '@scintilla-network/keys';
import { uint8array, json, varint, varbigint } from '@scintilla-network/keys/utils';
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';
import { Asset } from '../Asset/Asset.js';
import { Identity } from '../Identity/Identity.js';
import { Voucher } from '../Voucher/Voucher.js';
import GovernanceProposal from '../GovernanceProposal/GovernanceProposal.js';
import { StateActionData } from '../StateActionData/StateActionData.js';

import GovernanceVote from '../GovernanceVote/GovernanceVote.js';
import { Authorizations } from '../Authorizations/Authorizations.js';

import makeDoc from '../../utils/makeDoc.js';
import signDoc from '../../utils/signDoc.js';
import verifyDoc from '../../utils/verifyDoc.js';

export class Transaction {
    constructor(props = {}) {
        this.version = 1;
        this.kind = 'TRANSACTION';

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

    setTimelock(startTick, endTick) {
        this.timelock = {startTick, endTick};
        this.computeHash();
    }

    computeHash() {
        const stringified = sortedJsonByKeyStringify(this);
        const dataUint8Array = uint8array.fromString(stringified);
        const hash = sha256(dataUint8Array);
        return uint8array.toHex(hash);
    }

    toUint8Array(options = {}) {
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS[this.kind], 'uint8array');
        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');

        const clusterUint8Array = uint8array.fromString(this.cluster || '');
        const clusterLengthUint8Array = varint.encodeVarInt(clusterUint8Array.length, 'uint8array');

        const timestampUint8Array = varbigint.encodeVarBigInt(this.timestamp, 'uint8array');

        const actionUint8Array = uint8array.fromString(this.action || '');
        const actionLengthUint8Array = varint.encodeVarInt(actionUint8Array.length, 'uint8array');
        
        const typeUint8Array = uint8array.fromString(this.type || '');
        const typeLengthUint8Array = varint.encodeVarInt(typeUint8Array.length, 'uint8array');
       
        const dataUint8Array = this.data.toUint8Array();
        const dataTotalLengthUint8Array = varint.encodeVarInt(dataUint8Array.length, 'uint8array');

        const feeAmount = this.fees.length;
        const feeAmountBytes = varint.encodeVarInt(this.fees.length, 'uint8array');
        const feesUint8Array = [];

        for(let i = 0; i < feeAmount; i++) {
            const fee = uint8array.fromString(json.stringify(this.fees[i]));
            const feeLength = fee.length;
            feesUint8Array.push(...feeLength, ...fee);
        }

        // Timelock
        const timelockString = json.stringify(this.timelock);
        const timelockUint8Array = uint8array.fromString(timelockString);
        const timelockLengthUint8Array = varint.encodeVarInt(timelockUint8Array.length, 'uint8array');

        // const authorizationsLengthUint8Array = varint.encodeVarInt(this.authorizations.authorizations.length, 'uint8array');
        const authorizationsUint8Array = this.authorizations.toUint8Array();
        /*this.authorizations.forEach(authorization => {
            const authorizationUint8Array = authorization.toUint8Array();
            authorizationsUint8Array.push(...authorizationUint8Array);
        });*/

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + clusterLengthUint8Array.length + clusterUint8Array.length 
        + timestampUint8Array.length
        + actionLengthUint8Array.length + actionUint8Array.length 
        + typeLengthUint8Array.length + typeUint8Array.length 
        + dataTotalLengthUint8Array.length +  dataUint8Array.length 
        + feeAmountBytes.length + feesUint8Array.length 
        + timelockLengthUint8Array.length + timelockUint8Array.length
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
        result.set(feeAmountBytes, offset); offset += feeAmountBytes.length;
        result.set(feesUint8Array, offset); offset += feesUint8Array.length;
        result.set(timelockLengthUint8Array, offset); offset += timelockLengthUint8Array.length;
        result.set(timelockUint8Array, offset); offset += timelockUint8Array.length;
        if(options.excludeAuthorizations === false) {
            // result.set(authorizationsLengthUint8Array, offset); offset += authorizationsLengthUint8Array.length;
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }

        return result;
    }

    static fromHex(inputHex){
        return this.fromUint8Array(uint8array.fromHex(inputHex));
    }
    
    static fromUint8Array(inputArray) {
        const transactionProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['TRANSACTION']) {
            throw new Error('Invalid element kind');
        }
        transactionProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = varint.decodeVarInt(inputArray.subarray(offset));
        transactionProps.version = version;
        offset += versionLength;

        // Cluster
        const {value: clusterLength, length: clusterLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += clusterLengthBytes;
        transactionProps.cluster = uint8array.toString(inputArray.subarray(offset, offset + clusterLength));
        offset += clusterLength;

        // Timestamp
        const {value: timestamp, length: timestampBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        transactionProps.timestamp = timestamp;
        offset += timestampBytes;

        // Action
        const {value: actionLength, length: actionLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += actionLengthBytes;
        transactionProps.action = uint8array.toString(inputArray.subarray(offset, offset + actionLength));
        offset += actionLength;

        // Type
        const {value: typeLength, length: typeLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += typeLengthBytes;
        transactionProps.type = uint8array.toString(inputArray.subarray(offset, offset + typeLength));
        offset += typeLength;

        // Data
        const {value: dataTotalLength, length: dataTotalLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += dataTotalLengthBytes;
        transactionProps.data = StateActionData.fromUint8Array(inputArray.subarray(offset, offset + dataTotalLength));
        offset += dataTotalLength;

        // Fees
        const {value: feeAmount, length: feeAmountBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += feeAmountBytes;
        transactionProps.fees = [];

        for (let i = 0; i < feeAmount; i++) {
            const {value: feeLength, length: feeLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
            offset += feeLengthBytes;

            const feeString = uint8array.toString(inputArray.subarray(offset, offset + feeLengthBytes + feeLength));
            transactionProps.fees.push(json.parse(feeString));
            offset += feeLength;
        }

        // Timelock
        const {value: timelockLength, length: timelockLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += timelockLengthBytes;
        const timelockString = uint8array.toString(inputArray.subarray(offset, offset + timelockLength));
        transactionProps.timelock = json.parse(timelockString || {});
        offset += timelockLength;

        // Authorizations
        // const {value: authorizationsLength, length: authorizationsLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        // offset += authorizationsLengthBytes;
        const authBytes = inputArray.subarray(offset);
        transactionProps.authorizations = Authorizations.fromUint8Array(authBytes);
        offset += authBytes.length;

        return new Transaction(transactionProps);
    }

    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }


    toHash(encoding = 'hex', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hashUint8Array) : uint8array.toString(hashUint8Array);
    }

    toJSON({excludeAuthorizations = true} = {}) {
        const obj = {
            version: this.version,
            kind: this.kind,
            cluster: this.cluster,
            action: this.action,
            type: this.type,
            data: this.data.toJSON(),
            timestamp: this.timestamp,
            fees: this.fees,
            timelock: this.timelock,
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

    addAuthorization(authorization) {
        if(authorization.signature === '' || authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.addAuthorization(authorization);
    }

    verifyAuthorization() {
        return this.authorizations.verify(this);
    }

    toBase64() {
        const uint8Array = this.toUint8Array();
        return btoa(String.fromCharCode(...uint8Array));
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

export default Transaction;

