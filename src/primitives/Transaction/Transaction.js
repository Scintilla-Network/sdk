import { sha256 } from '@scintilla-network/hashes/classic';
import { SignableMessage } from '@scintilla-network/keys';
import { uint8array, varint ,varbigint } from '@scintilla-network/keys/utils';
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';
import { serialize } from '../../utils/serialize/index.js';
// import { deserialize } from '../../utils/deserialize/index.js';
import deserialize from '../../utils/deserialize/index.js';
import makeDoc from '../../utils/makeDoc.js';   
import { kindToConstructor } from '../../utils/kindToConstructor.js';

function loadData(data) {
    return data.map(datum => {
        try {
            if(datum.kind && !datum.fromJSON){
                const constructor = kindToConstructor(datum.kind);
                const object = constructor.fromJSON(datum);
                return object;
            }
            return datum;
        } catch (e) {
            console.error('Failed to parse datum:', e, datum);
            console.dir({
                datum,
            }, {depth: null});
            throw new Error(`Failed to parse datum: ${e.message}`);
        }
    });
}

export class Transaction {
    constructor(props = {}) {
        this.version = props.version || 1;
        this.kind = 'TRANSACTION';

        this.cluster = props.cluster || null;
        this.timestamp = props.timestamp ? BigInt(props.timestamp) : BigInt(Date.now());

        this.action = props.action || null;
        this.type = props.type || null;

        this.data = loadData(props?.data || []);
        
        this.timelock = {startTick: BigInt(props?.timelock?.startTick ?? 0n), endTick: BigInt(props?.timelock?.endTick ?? 0n)};

        this.fees = props?.fees || [];
        this.authorizations = Authorization.fromAuthorizationsJSON({ authorizations: props.authorizations });
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
            throw new Error(`Invalid element kind: ${elementKind}(${NET_KINDS_ARRAY[elementKind]}) - Expected: ${NET_KINDS['TRANSACTION']}(TRANSACTION)`);
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
        const data = deserialize.toArray(inputArray.subarray(offset));
        transactionProps.data = data.value;
        offset += dataTotalLength;

       // Timelock
        const {value: startTick, length: startTickBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        offset += startTickBytes;
        const {value: endTick, length: endTickBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        offset += endTickBytes;
        transactionProps.timelock = {startTick: BigInt(startTick), endTick: BigInt(endTick)};


        // Fees
        const {value: feesTotalLength, length: feesTotalLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += feesTotalLengthBytes;
        const fees = deserialize.toArray(inputArray.subarray(offset));
        transactionProps.fees = fees.value;
        offset += feesTotalLength;

        // Authorizations
        // const {value: authorizationsLength, length: authorizationsLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        // offset += authorizationsLengthBytes;
        // const authBytes = inputArray.subarray(offset);
        // transactionProps.authorizations = Authorizations.fromUint8Array(authBytes);
        // offset += authBytes.length;
        transactionProps.authorizations = Authorization.fromAuthorizationsUint8Array(inputArray.subarray(offset));
        return new Transaction(transactionProps);
    }

    static fromJSON(json) {
        return new Transaction({
            ...json,
        });
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
       
        // Data
        const dataUint8Array = serialize.fromArray(this.data);
        const dataTotalLengthUint8Array = varint.encodeVarInt(dataUint8Array.value.length, 'uint8array');

        // Timelock
        const timelockStartAtUint8Array = varbigint.encodeVarBigInt(this.timelock.startTick, 'uint8array');
        const timelockEndAtUint8Array = varbigint.encodeVarBigInt(this.timelock.endTick, 'uint8array');

        // Fees
        const feesUint8Array = serialize.fromArray(this.fees);
        const feesLengthUint8Array = varint.encodeVarInt(feesUint8Array.value.length, 'uint8array');

        let authorizationsUint8Array = new Uint8Array();
        if(options.excludeAuthorizations === false) {
            authorizationsUint8Array = Authorization.toAuthorizationsUint8Array(this.authorizations);
        }

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + clusterLengthUint8Array.length + clusterUint8Array.length 
        + timestampUint8Array.length
        + actionLengthUint8Array.length + actionUint8Array.length 
        + typeLengthUint8Array.length + typeUint8Array.length 
        + dataTotalLengthUint8Array.length + dataUint8Array.value.length
        + timelockStartAtUint8Array.length + timelockEndAtUint8Array.length 
        + feesLengthUint8Array.length + feesUint8Array.value.length 
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

        // Data
        result.set(dataTotalLengthUint8Array, offset); offset += dataTotalLengthUint8Array.length;
        result.set(dataUint8Array.value, offset); offset += dataUint8Array.value.length;

        // Timelock
        result.set(timelockStartAtUint8Array, offset); offset += timelockStartAtUint8Array.length;
        result.set(timelockEndAtUint8Array, offset); offset += timelockEndAtUint8Array.length;

        // Fees
        result.set(feesLengthUint8Array, offset); offset += feesLengthUint8Array.length;
        result.set(feesUint8Array.value, offset); offset += feesUint8Array.value.length;

        if(options.excludeAuthorizations === false) {
            // result.set(authorizationsLengthUint8Array, offset); offset += authorizationsLengthUint8Array.length;
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }

        return result;
    }

    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }


    toHash(encoding = 'hex', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hashUint8Array) : uint8array.toString(hashUint8Array);
    }

    toJSON({excludeAuthorizations = false} = {}) {
        const obj = {
            kind: this.kind,
            version: this.version,
            cluster: this.cluster,
            timestamp: this.timestamp,
            action: this.action,
            type: this.type,
            data: this.data,
            timelock: this.timelock,
            fees: this.fees,
        };

        if (excludeAuthorizations === false) {
            obj['authorizations'] = Authorization.toAuthorizationsJSON(this.authorizations);
        }
        return obj;
    }

    addAuthorization(authorization) {
        if(authorization.signature === '' || authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.push(authorization);
    }

    verifyAuthorization() {
        return this.authorizations.every(auth => auth.verify(this));
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
        let authorization = new Authorization();
        const existingAuthorization = this.authorizations.find(auth => auth.moniker === signer.getMoniker());
        if(existingAuthorization){
            this.authorizations.splice(this.authorizations.indexOf(existingAuthorization), 1);
        }
        authorization = await authorization.sign(this, signer, true);
        this.authorizations.push(authorization);
        return this;
        // return signDoc(await this.toDoc(signer));
    }

    validate() {
        if (!this.authorizations) return {valid: false, error: 'Authorizations are required.'};

        const signedAuthorizations = this.authorizations.filter(auth => auth.signature);
        if (!signedAuthorizations.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedAuthorizations.filter(auth => auth.publicKey);
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

