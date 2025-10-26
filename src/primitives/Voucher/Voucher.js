import { uint8array } from '@scintilla-network/keys/utils';
import { serialize, deserialize } from '@scintilla-network/serialize';
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

export class Voucher {
    constructor({
        version = 1,
        timestamp,
        hash,
        asset,
        inputs = [],
        output = { amount: 0n, recipient: '' },
        stack = [],
        data = [],
        timelock = { startTick: 0n, endTick: 0n },
        authorizations = [],
    } = {}) {
        this.kind = 'VOUCHER';
        this.version = version;
        this.timestamp = timestamp ? BigInt(timestamp) : BigInt(Date.now());

        this.asset = asset?.toLowerCase() ?? '';
        this.inputs = inputs?.map(input => ({ amount: BigInt(input.amount), hash: input.hash })) ?? [];
        this.output = { amount: BigInt(output.amount), recipient: output.recipient };
        this.stack = stack; 
        // Stack are not active on V1
        if(this.stack.length > 0) {
            throw new Error('Stack is not supported on V1');
        }
        this.data = loadData(data);

        this.timelock = {startTick: BigInt(timelock?.startTick ?? 0), endTick: BigInt(timelock?.endTick ?? 0)};
        this.authorizations = Authorization.fromAuthorizationsJSON({ authorizations });
        this.hash = hash ?? this.toHash('hex');
    }


    static fromUint8Array(inputArray) {
        let offset = 0;

        const {value: elementKind, length: elementKindBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += elementKindBytes;
        if(elementKind !== NET_KINDS['VOUCHER']) {
            throw new Error(`Invalid element kind: ${elementKind}(${NET_KINDS_ARRAY[elementKind]}) - Expected: ${NET_KINDS['VOUCHER']}(VOUCHER)`);
        }

        const kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += versionBytes;
        if(version !== 1) {
            throw new Error(`Invalid version: ${version} - Expected: 1`);
        }

        const { value: timestamp, length: timestampBytes } = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += timestampBytes;

        const { value: assetLength, length: assetLengthBytes } = deserialize.toVarInt(inputArray.subarray(offset));
        offset += assetLengthBytes;

        const asset = uint8array.toString(inputArray.subarray(offset, offset + assetLength));
        offset += assetLength;

        const { value: inputsAmount, length: inputsAmountBytes } = deserialize.toVarInt(inputArray.subarray(offset));
        offset += inputsAmountBytes;

        const inputs = [];
        for (let i = 0; i < inputsAmount; i++) {
            const { value: inputAmount, length: inputAmountBytes } = deserialize.toVarBigInt(inputArray.subarray(offset));
            offset += inputAmountBytes;

            const inputHashLength = deserialize.toVarInt(inputArray.subarray(offset));
            offset += inputHashLength.length
            const inputHash = uint8array.toHex(inputArray.subarray(offset, offset + inputHashLength.value));
            offset += inputHashLength.value;   

            inputs.push({ amount: BigInt(inputAmount), hash: inputHash });
        }
     
        
        const { value: outputAmount, length: outputAmountBytes } = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += outputAmountBytes;

        const { value: outputRecipientLengthValue, length: outputRecipientLengthBytes } = deserialize.toVarInt(inputArray.subarray(offset));
        offset += outputRecipientLengthBytes;

        const outputRecipient = inputArray.subarray(offset, offset + outputRecipientLengthValue);
        offset += outputRecipientLengthValue;

        const output = { amount: outputAmount, recipient: uint8array.toString(outputRecipient) };



        // Stack
        const { value: stackLength, length: stackLengthBytes } = deserialize.toVarInt(inputArray.subarray(offset));
        offset += stackLengthBytes;
        const stack = [];
        for (let i = 0; i < stackLength; i++) {
            const { value: itemLength, length: itemLengthBytes } = deserialize.toVarInt(inputArray.subarray(offset));
            offset += itemLengthBytes;
            const item = uint8array.toString(inputArray.subarray(offset, offset + itemLengthBytes));
            offset += itemLength;
            stack.push(item);
        }

        // Data
        const { value: dataTotalLength, length: dataTotalLengthBytes } = deserialize.toVarInt(inputArray.subarray(offset));
        offset += dataTotalLengthBytes;
        const data = deserialize.toObject(inputArray.subarray(offset, offset + dataTotalLength), kindToConstructor).value;
        offset += dataTotalLength;

        // Timelock (each value var int)
        const { value: startTick, length: startTickBytes } = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += startTickBytes;
        const { value: endTick, length: endTickBytes } = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += endTickBytes;
        const timelock = { startTick: BigInt(startTick), endTick: BigInt(endTick) };

        const authorizations = Authorization.fromAuthorizationsUint8Array(inputArray.subarray(offset));

        const props = {
            kind,
            version,
            timestamp,
            asset,  
            inputs,
            output,
            stack,
            data,
            timelock,
            authorizations
        };
        return new Voucher(props);
    }

    static fromHex(hex) {
        return Voucher.fromUint8Array(uint8array.fromHex(hex));
    }

    static fromJSON(json) {
        return new Voucher({
            ...json,
            inputs: json.inputs.map(input => ({ amount: BigInt(input.amount), hash: input.hash })),
            output: { amount: BigInt(json.output.amount), recipient: json.output.recipient },
            stack: json.stack,
            data: json.data,
            timelock: { startTick: BigInt(json?.timelock?.startTick ?? 0), endTick: BigInt(json?.timelock?.endTick ?? 0) },
            authorizations: Authorization.fromAuthorizationsJSON({ authorizations: json.authorizations }),
        });
    }

    toUint8Array(options = {}) {
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }
        const {value: elementKindUint8Array, length: elementKindUint8ArrayBytes} = serialize.fromVarInt(NET_KINDS.VOUCHER, 'uint8array');
        const {value: versionUint8Array, length: versionUint8ArrayBytes} = serialize.fromVarInt(this.version, 'uint8array');

        const {value: timestampUint8Array, length: timestampUint8ArrayBytes} = serialize.fromVarBigInt(this.timestamp, 'uint8array');

        const assetUint8Array = uint8array.fromString(this.asset);
        const {value: assetLengthUint8Array, length: assetLengthUint8ArrayBytes} = serialize.fromVarInt(assetUint8Array.length, 'uint8array');

        // Inputs
        const {value: inputsAmountUint8Array, length: inputsAmountUint8ArrayBytes} = serialize.fromVarInt(this.inputs.length, 'uint8array');
        let inputsItemsUint8Array = new Uint8Array();

        this.inputs.forEach(input => {
            const {value: inputAmountUint8Array, length: inputAmountUint8ArrayBytes} = serialize.fromVarBigInt(input.amount, 'uint8array');
            const inputHashBytes = uint8array.fromHex(input.hash);
            const {value: hashLengthUint8Array, length: hashLengthUint8ArrayBytes} = serialize.fromVarInt(inputHashBytes.length, 'uint8array');

            const length = inputAmountUint8Array.length + hashLengthUint8Array.length + inputHashBytes.length;
            const inputUint8Array = new Uint8Array(length);
            inputUint8Array.set(inputAmountUint8Array, 0);
            inputUint8Array.set(hashLengthUint8Array, inputAmountUint8Array.length);
            inputUint8Array.set(inputHashBytes, inputAmountUint8Array.length + hashLengthUint8Array.length);
            inputsItemsUint8Array = new Uint8Array([...inputsItemsUint8Array, ...inputUint8Array]);

        });

        // Only one output
        const {value: outputAmountUint8Array, length: outputAmountUint8ArrayBytes} = serialize.fromVarBigInt(this.output.amount, 'uint8array');

        // Recipient length is encoded as varint
        const {value: outputRecipientLengthUint8Array, length: outputRecipientLengthUint8ArrayBytes} = serialize.fromVarInt(this.output.recipient.length, 'uint8array');
        const outputRecipientUint8Array = uint8array.fromString(this.output.recipient);

        // Stack length is encoded as varint
        const {value: stackLengthUint8Array, length: stackLengthUint8ArrayBytes} = serialize.fromVarInt(this.stack.length, 'uint8array');
        const stackUint8Array = [];
        // Stack are not active on V1
        if(this.stack.length > 0) {
            throw new Error('Stack is not supported on V1');
        }
       

        const dataUint8Array = serialize.fromObject(this.data, kindToConstructor).value;
        const {value: dataTotalLengthUint8Array, length: dataTotalLengthUint8ArrayBytes} = serialize.fromVarInt(dataUint8Array.length, 'uint8array');

        // Timelock
        const {value: timelockStartAtUint8Array, length: timelockStartAtUint8ArrayBytes} = serialize.fromVarBigInt(this.timelock.startTick, 'uint8array');
        const {value: timelockEndAtUint8Array, length: timelockEndAtUint8ArrayBytes} = serialize.fromVarBigInt(this.timelock.endTick, 'uint8array');


        // Authorizations
        let authorizationsUint8Array = new Uint8Array();
        if(options.excludeAuthorizations === false) {
            authorizationsUint8Array = Authorization.toAuthorizationsUint8Array(this.authorizations);
        }

        let totalLength = 
        (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + timestampUint8Array.length
        + assetUint8Array.length + assetLengthUint8Array.length
        + inputsAmountUint8Array.length + inputsItemsUint8Array.length 
        + outputAmountUint8Array.length + outputRecipientLengthUint8Array.length + outputRecipientUint8Array.length 
        + stackLengthUint8Array.length + stackUint8Array.length
        + dataTotalLengthUint8Array.length + dataUint8Array.length
        + timelockStartAtUint8Array.length + timelockEndAtUint8Array.length //+ timelockCreatedAtUint8Array.length
        + (options.excludeAuthorizations ? 0 : authorizationsUint8Array.length);

        const result = new Uint8Array(totalLength);
        let offset = 0;

        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;
        // Asset length
        result.set(assetLengthUint8Array, offset); offset += assetLengthUint8Array.length;
        // Asset
        result.set(assetUint8Array, offset); offset += assetUint8Array.length;
            // Input length
        result.set(inputsAmountUint8Array, offset); offset += inputsAmountUint8Array.length;
        // Inputs
        result.set(inputsItemsUint8Array, offset); offset += inputsItemsUint8Array.length;

        // Output
        result.set(outputAmountUint8Array, offset); offset += outputAmountUint8Array.length;

        // Output recipient
        result.set(outputRecipientLengthUint8Array, offset); offset += outputRecipientLengthUint8Array.length;
        result.set(outputRecipientUint8Array, offset); offset += outputRecipientUint8Array.length;

        // Stack
        result.set(stackLengthUint8Array, offset); offset += stackLengthUint8Array.length;
        result.set(stackUint8Array, offset); offset += stackUint8Array.length;  

        // Data
        result.set(dataTotalLengthUint8Array, offset); offset += dataTotalLengthUint8Array.length;
        result.set(dataUint8Array, offset); offset += dataUint8Array.length;

        result.set(timelockStartAtUint8Array, offset); offset += timelockStartAtUint8Array.length;
        result.set(timelockEndAtUint8Array, offset); offset += timelockEndAtUint8Array.length;

        if(options.excludeAuthorizations === false) {
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }
        return result;
    }

    toHash(encoding = 'uint8array', {excludeAuthorizations = true} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    toHex( {excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }

    toJSON({excludeAuthorizations = false} = {}) {
        const json = {
            kind: this.kind,
            version: this.version,
            timestamp: this.timestamp,
            asset: this.asset,
            inputs: this.inputs.map(input => ({
                ...input,
                amount: input.amount.toString()
            })),
            output: {
                amount: this.output.amount.toString(),
                recipient: this.output.recipient
            },
            stack: this.stack,
            data: this.data,
            timelock: {
                startTick: this.timelock.startTick.toString(),
                endTick: this.timelock.endTick.toString(),
            },
        };

        if (!excludeAuthorizations) {
            json.authorizations = Authorization.toAuthorizationsJSON(this.authorizations);
        }

        return json;
    }

    addAuthorization(authorization) {
        if(authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        if(!authorization.verify){
            authorization = new Authorization(authorization);
        }
        this.authorizations.push(authorization);
    }

    verifyAuthorizations() {
        return this.authorizations.every(auth => auth.verify(this).valid);
    }

    toBase64() {
        const uint8Array = this.toUint8Array();
        return btoa(String.fromCharCode(...uint8Array));
    }

    toSignableMessage() {
        return new SignableMessage(this.toHash('hex', {excludeAuthorizations: true}));
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

    getPublicKey() {
        return this.authorizations?.[0]?.publicKey ? uint8array.toHex(this.authorizations[0].publicKey) : undefined;
    }

    validate() {
        if (!this.authorizations || this.authorizations.length === 0) {
            return {valid: false, error: 'Authorizations are required.'};
        }

        const signedAuthorizations = this.authorizations.filter(auth => auth.signature);
        if (signedAuthorizations.length === 0) {
            return {valid: false, error: 'At least one authorization with signature is required.'};
        }

        const authWithPublicKey = signedAuthorizations.filter(auth => auth.publicKey);
        if(authWithPublicKey.length === 0) {
            return {valid: false, error: 'At least one authorization with public key is required.'};
        }

        if (!this.verifyAuthorizations()) {
            return {valid: false, error: 'Invalid authorization.'};
        }

        return {valid: true, error: ''};
    }

    isValid() {
        const {valid, error} = this.validate();
        return valid;
    }

    isValidAtTime(currentTick) {
        if (!this.timelock) return true;
        return currentTick >= this.timelock.startTick && currentTick <= this.timelock.endTick;
    }

    getTotalInput() {
        return this.inputs.reduce((sum, input) => sum + BigInt(input.amount), 0n);
    }

    getTotalOutput() {
        return BigInt(this.output.amount);
    }
}

export default Voucher;

