// src/primitives/Transition/Transition.js
// import { sha256 } from "../../utils/hash.js";
import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
import makeDoc from "../../utils/makeDoc.js";
import { SignableMessage } from "@scintilla-network/keys";
import { varint, uint8array, json, varbigint } from "@scintilla-network/keys/utils";
import signDoc from "../../utils/signDoc.js";
import verifyDoc from "../../utils/verifyDoc.js";
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';
import { Identity } from '../Identity/Identity.js';
import { Voucher } from '../Voucher/Voucher.js';
import GovernanceProposal from '../GovernanceProposal/GovernanceProposal.js';
import GovernanceVote from '../GovernanceVote/GovernanceVote.js';
import { Transfer } from '../Transfer/Transfer.js';
import { Transaction } from '../Transaction/Transaction.js';
import { StateActionData } from '../StateActionData/StateActionData.js';
import { Authorizations } from '../Authorizations/Authorizations.js';

// import uInt8ArrayToHex from "../../utils/uInt8ArrayToHex.js";

function parseUint8ArrayItem(item) {
    const kind = varint.decodeVarInt(item.subarray(0, 1));
    const kindString = NET_KINDS_ARRAY[kind.value];

    switch(kindString.toUpperCase()) {
        case 'IDENTITY':
            return Identity.fromUint8Array(item);
            break;
        case 'VOUCHER':
            return Voucher.fromUint8Array(item);
            break;
        case 'GOVERNANCEPROPOSAL':
            return GovernanceProposal.fromUint8Array(item);
            break;
        case 'GOVERNANCEVOTE':
            return GovernanceVote.fromUint8Array(item);
            break;
        case 'TRANSFER':
            return Transfer.fromUint8Array(item);
            break;
        case 'TRANSACTION':
            return Transaction.fromUint8Array(item);
            break;  
        default:
            throw new Error(`Unsupported item parseUint8ArrayItem kind: ${kindString.toUpperCase()}`);
    }
}
function parseObjectItem(item) {
    switch(item.kind.toUpperCase()) {
        case 'IDENTITY':
            return new Identity(item);
            break;
        case 'VOUCHER':
            return new Voucher(item);
            break;
        case 'GOVERNANCEPROPOSAL':
            return new GovernanceProposal(item);
            break;
        case 'GOVERNANCEVOTE':
            return new GovernanceVote(item);
            break;
        case 'TRANSFER':
            return new Transfer(item);
            break;
        case 'TRANSACTION':
            return new Transaction(item);
            break;  
        default:
            throw new Error(`Unsupported item parseObjectItem kind: ${item.kind.toUpperCase()}`);
    }
};

function parseData(data) {
    if(!Array.isArray(data)) {
        throw new Error('Data must be an array');
    }
    return data.map(item => {
        // If the item is a Uint8Array, we need to read for the kind part (first 2 bytes) to determine the kind
        if(item instanceof Uint8Array) {
            return parseUint8ArrayItem(item);
        }
        if(!item.kind) {
            throw new Error('Item must have a kind');
        }
        if(item.kind !== item.constructor.name) {
            return parseObjectItem(item);
        }
        return item;
    });
}

export class Transition {
    constructor(props = {}) {
        this.version = 1;
        this.kind = 'TRANSITION';

        this.cluster = props.cluster || null;
        this.action = props.action || null;
        this.type = props.type || null;
        this.data = new StateActionData(props.data);
        this.timestamp = props.timestamp || BigInt(Date.now());

        this.authorizations = new Authorizations(props.authorizations);
        this.fees = props.fees || [];
        this.version = props.version || 1;

        this.timelock = props.timelock;
    }

    computeHash() {
        const stringified = json.sortedJsonByKeyStringify(this);
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

        const authorizationsUint8Array = this.authorizations.toUint8Array();
        // const authorizationsLengthUint8Array = varint.encodeVarInt(authorizationsUint8Array.length, 'uint8array');

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + clusterLengthUint8Array.length + clusterUint8Array.length 
        + timestampUint8Array.length
        + actionLengthUint8Array.length + actionUint8Array.length 
        + typeLengthUint8Array.length + typeUint8Array.length 
        + dataTotalLengthUint8Array.length + dataUint8Array.length 
        + feesLengthUint8Array.length + feesUint8Array.length 
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
        if(options.excludeAuthorizations === false) {
            // result.set(authorizationsLengthUint8Array, offset); offset += authorizationsLengthUint8Array.length;
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
        const clusterBytes = inputArray.subarray(offset, offset + clusterLength);
        transitionProps.cluster = uint8array.toString(clusterBytes);
        offset += clusterLength;

        // Timestamp
        const {value: timestamp, length: timestampBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        transitionProps.timestamp = timestamp;
        offset += timestampBytes;

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
        const {value: dataTotalLength, length: dataTotalLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += dataTotalLengthBytes;
        transitionProps.data = StateActionData.fromUint8Array(inputArray.subarray(offset, offset + dataTotalLength));
        offset += dataTotalLength;

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
        // const {value: authorizationsLength, length: authorizationsLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        // offset += authorizationsLengthBytes;
        const authBytes = inputArray.subarray(offset);
        transitionProps.authorizations = Authorizations.fromUint8Array(authBytes);
        offset += authBytes.length;

        return new Transition(transitionProps);
    }
    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }

    toHash(encoding = 'hex', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({ excludeAuthorizations });
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hashUint8Array) : uint8array.toString(hashUint8Array);
    }

    toJSON({excludeAuthorizations = true} = {}) {
        const obj = {
            kind: this.kind,
            version: this.version,
            timestamp: this.timestamp,
            cluster: this.cluster,
            action: this.action,
            type: this.type,
            data: this.data.toJSON(),
            fees: this.fees,
        };

        if (!excludeAuthorizations) {
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

    verifyAuthorizations() {
    //    return verifyDoc(this);
        return this.authorizations.verify(this);
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
        this.authorizations.sign(this, signer);
        return this;
        // return signDoc(await this.toDoc(signer));
    }

    getPublicKey() {
        return this.authorizations?.[0]?.publicKey;
    }

    validate() {
        if (!this.authorizations) return {valid: false, error: 'Authorizations are required.'};

        const signedAuthorizations = this.authorizations.authorizations.filter(authorization => authorization.signature);
        if (!signedAuthorizations.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedAuthorizations.filter(authorization => authorization.publicKey);
        if(authWithPublicKey.length < 0) return {valid: false, error: 'At least one authorization with public key is required.'};

        if (!this.verifyAuthorizations()) return {valid: false,error: 'Invalid signature.'};
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
