import { serialize, deserialize } from '@scintilla-network/serialize';
import { uint8array, json } from '@scintilla-network/keys/utils';
import { sha256 } from '@scintilla-network/hashes/classic';
import { SignableMessage } from '@scintilla-network/keys';

import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';
import { kindToConstructor } from '../../utils/kindToConstructor.js';

function loadData(data) {
    return data.map(datum => {
        try {
            if(datum.kind && !datum.fromJSON){
                const constructor = kindToConstructor(datum.kind);
                return constructor.fromJSON(datum);
            }
            return datum;
        } catch (e) {
            console.error('Failed to parse datum:', e, datum);
            throw new Error(`Failed to parse datum: ${e.message}`);
        }
    });
}

export class Transfer {
    constructor(props = {}) {
        this.version = props.version || 1;
        this.kind = 'TRANSFER';

        this.cluster = props.cluster || null;
        this.timestamp = props.timestamp ? BigInt(props.timestamp) : BigInt(Date.now());

        this.action = props.action || null;
        this.type = props.type || null;
        
        this.data = loadData(props?.data ?? []);

        this.timelock = {startTick: BigInt(props?.timelock?.startTick ?? 0), endTick: BigInt(props?.timelock?.endTick ?? 0)};
        
        this.fees = props?.fees ?? [];
        this.authorizations = Authorization.fromAuthorizationsJSON({ authorizations: props.authorizations });
    }

    static fromJSON(json) {
        return new Transfer({
            ...json,
        });
    }

    static fromHex(hex) {
        return this.fromUint8Array(uint8array.fromHex(hex));
    }

    static fromUint8Array(inputArray) {
        const transferProps = {};

        let offset = 0;

        const {value: elementKind, length: elementKindLength} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['TRANSFER']) {
            throw new Error(`Invalid element kind: ${elementKind}(${NET_KINDS_ARRAY[elementKind]}) - Expected: ${NET_KINDS['TRANSFER']}(TRANSFER)`);
        }
        transferProps.kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionLength} = deserialize.toVarInt(inputArray.subarray(offset));
        transferProps.version = version;
        offset += versionLength;

        // Cluster
        const {value: clusterLength, length: clusterLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += clusterLengthBytes;
        transferProps.cluster = uint8array.toString(inputArray.subarray(offset, offset + clusterLength));
        offset += clusterLength;

        // Timestamp
        const {value: timestamp, length: timestampBytes} = deserialize.toVarBigInt(inputArray.subarray(offset));
        transferProps.timestamp = timestamp;
        offset += timestampBytes;
     
        // Action
        const {value: actionLength, length: actionLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += actionLengthBytes;
        transferProps.action = uint8array.toString(inputArray.subarray(offset, offset + actionLength));
        offset += actionLength;

        // Type
        const {value: typeLength, length: typeLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += typeLengthBytes;
        transferProps.type = uint8array.toString(inputArray.subarray(offset, offset + typeLength));
        offset += typeLength;

        // Data
        const {value: dataTotalLength, length: dataTotalLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += dataTotalLengthBytes;
        const data = deserialize.toObject(inputArray.subarray(offset), kindToConstructor);
        transferProps.data = data.value;
        offset += dataTotalLength;

        // Timelock
        const {value: startTick, length: startTickBytes} = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += startTickBytes;
        const {value: endTick, length: endTickBytes} = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += endTickBytes;
        transferProps.timelock = {startTick: BigInt(startTick), endTick: BigInt(endTick)};

        // Fees
        const {value: feesTotalLength, length: feesTotalLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += feesTotalLengthBytes;
        const fees = deserialize.toObject(inputArray.subarray(offset), kindToConstructor);
        transferProps.fees = fees.value;
        offset += feesTotalLength;

        // Authorizations
        transferProps.authorizations = Authorization.fromAuthorizationsUint8Array(inputArray.subarray(offset));
        return new Transfer(transferProps);
    }


    toUint8Array(options = {}) {
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const {value: elementKindUint8Array, length: elementKindLengthUint8Array} = serialize.fromVarInt(NET_KINDS['TRANSFER']);
        const {value: versionUint8Array, length: versionLengthUint8Array} = serialize.fromVarInt(this.version);

        const clusterUint8Array = uint8array.fromString(this.cluster);
        const {value: clusterLengthUint8Array, length: clusterLengthLengthUint8Array} = serialize.fromVarInt(clusterUint8Array.length);

        const {value: timestampUint8Array, length: timestampLengthUint8Array} = serialize.fromVarBigInt(this.timestamp);

        const actionUint8Array = uint8array.fromString(this.action);
        const {value: actionLengthUint8Array, length: actionLengthLengthUint8Array} = serialize.fromVarInt(actionUint8Array.length);
        
        const typeUint8Array = uint8array.fromString(this.type);
        const {value: typeLengthUint8Array, length: typeLengthLengthUint8Array} = serialize.fromVarInt(typeUint8Array.length);

        const dataUint8Array = serialize.fromObject(this.data);
        const {value: dataTotalLengthUint8Array, length: dataTotalLengthLengthUint8Array} = serialize.fromVarInt(dataUint8Array.value.length);

        // Timelock
        const {value: timelockStartAtUint8Array, length: timelockStartAtLengthUint8Array} = serialize.fromVarBigInt(this.timelock.startTick);
        const {value: timelockEndAtUint8Array, length: timelockEndAtLengthUint8Array} = serialize.fromVarBigInt(this.timelock.endTick);

        // Fees
        const feesUint8Array = serialize.fromObject(this.fees);
        const {value: feesLengthUint8Array, length: feesLengthLengthUint8Array} = serialize.fromVarInt(feesUint8Array.value.length);

        let authorizationsUint8Array = new Uint8Array();
        if(options.excludeAuthorizations === false) {
            authorizationsUint8Array = Authorization.toAuthorizationsUint8Array(this.authorizations);
        }

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindLengthUint8Array) 
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
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }
        return result;
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

    toHash(encoding = 'uint8array', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
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

        if (!excludeAuthorizations) {
            obj.authorizations = Authorization.toAuthorizationsJSON(this.authorizations);
        }

        return obj;
    }

    verifyAuthorizations() {
        return this.authorizations.every(auth => auth.verify(this).valid);
    }

    getPublicKey() {
        return this.authorizations?.[0]?.publicKey;
    }

    toBase64() {
        const uint8Array = this.toUint8Array();
        return btoa(String.fromCharCode(...uint8Array));
    }

    addAuthorization(authorization) {
        if (authorization.signature === '' || authorization.signature === undefined) {
            throw new Error('Signature is required for authorization.');
        }
        if(!authorization.verify){
            authorization = new Authorization(authorization);
        }
        this.authorizations.push(authorization);
    }

    toSignableMessage({excludeAuthorizations = false} = {}) {
        return new SignableMessage(this.toHex({excludeAuthorizations}));
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

    validate() {
        if (!this.authorizations) return {valid: false, error: 'Authorizations are required.'};

        const signedAuthorizations = this.authorizations.filter(auth => auth.signature);
        if (!signedAuthorizations.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedAuthorizations.filter(auth => auth.publicKey);
        if(authWithPublicKey.length < 0) return {valid: false, error: 'At least one authorization with public key is required.'};

        if (!this.verifyAuthorizations()) return {valid: false,error: 'Invalid signature.'};
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

