import { sha256  } from '@scintilla-network/hashes/classic';
import makeDoc from '../../utils/makeDoc.js';
import { uint8array, hex, varint, json, varbigint, utf8 } from '@scintilla-network/keys/utils';
const { decodeVarBigInt, encodeVarBigInt } = varbigint;
const { decodeVarInt, encodeVarInt } = varint;
import transformObjectNumbersToBigInt from '../../utils/transformObjectNumbersToBigInt.js';

// @ts-ignore
import { SignableMessage } from '@scintilla-network/keys';
import signDoc from '../../utils/signDoc.js';
// import verifyDoc from '../../utils/verifyDoc.js';

import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
// import { Authorization } from '../Authorization/Authorization.js';
import { Authorizations } from '../Authorizations/Authorizations.js';

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
        timelock = { startAt: 0n, endAt: 0n },
        authorizations = [],
    } = {}) {
        this.kind = 'VOUCHER';
        this.version = version;
        this.timestamp = timestamp || BigInt(Date.now());

        this.asset = asset?.toLowerCase() ?? '';
        this.inputs = transformObjectNumbersToBigInt(inputs);
        this.output = output;
        this.stack = stack; 
        // Stack are not active on V1
        if(this.stack.length > 0) {
            throw new Error('Stack is not supported on V1');
        }
        this.data = data;
        if(this.data.length > 1) {
            throw new Error('V1 Limit for data to max 1 item');
        }
        this.timelock = transformObjectNumbersToBigInt(timelock);
        // this.authorizations = authorizations.map(auth => ({
        //     ...auth,
        //     signature: typeof auth.signature === 'string' ? uint8array.fromHex(auth.signature) : auth.signature,
        //     publicKey: typeof auth.publicKey === 'string' ? uint8array.fromHex(auth.publicKey) : auth.publicKey
        // }));
        this.authorizations = new Authorizations(authorizations);
        // this.authorizations = 
        
        this.hash = hash ?? this.computeHash();
    }

    static fromJSON(json) {
        return new Voucher(json);
    }

    toUint8Array(options = {}) {
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['VOUCHER'], 'uint8array');
        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');

        const timestampUint8Array = varbigint.encodeVarBigInt(this.timestamp, 'uint8array');

        const assetUint8Array = uint8array.fromString(this.asset);
        const assetLengthUint8Array = varint.encodeVarInt(assetUint8Array.length, 'uint8array');

        // Inputs
        const inputsAmountUint8Array = varint.encodeVarInt(this.inputs.length, 'uint8array');
        let inputsItemsUint8Array = new Uint8Array();

        this.inputs.forEach(input => {
            const inputAmountUint8Array = varbigint.encodeVarBigInt(input.amount, 'uint8array');
            const inputHashBytes = uint8array.fromHex(input.hash);
            const hashLengthUint8Array = varint.encodeVarInt(inputHashBytes.length, 'uint8array');

            const length = inputAmountUint8Array.length + hashLengthUint8Array.length + inputHashBytes.length;
            const inputUint8Array = new Uint8Array(length);
            inputUint8Array.set(inputAmountUint8Array, 0);
            inputUint8Array.set(hashLengthUint8Array, inputAmountUint8Array.length);
            inputUint8Array.set(inputHashBytes, inputAmountUint8Array.length + hashLengthUint8Array.length);
            inputsItemsUint8Array = new Uint8Array([...inputsItemsUint8Array, ...inputUint8Array]);

        });

        // Only one output
        const outputAmountUint8Array = varbigint.encodeVarBigInt(this.output.amount, 'uint8array');

        // Recipient length is encoded as varint
        const outputRecipientLengthUint8Array = varint.encodeVarInt(this.output.recipient.length, 'uint8array');
        const outputRecipientUint8Array = uint8array.fromString(this.output.recipient);

        // Stack length is encoded as varint
        const stackLengthUint8Array = varint.encodeVarInt(this.stack.length, 'uint8array');
        const stackUint8Array = [];
        // Stack are not active on V1
        if(this.stack.length > 0) {
            throw new Error('Stack is not supported on V1');
        }
        // this.stack.forEach(item => {
        //     const itemLengthUint8Array = varint.encodeVarInt(item.length, 'uint8array');
        //     const itemUint8Array = uint8array.fromString(item);
        //     stackUint8Array.push(...itemLengthUint8Array, ...itemUint8Array);
        // });

        // Data length is encoded as varint 
        const dataLengthUint8Array = varint.encodeVarInt(this.data.length, 'uint8array');
        if(this.data.length > 1) {
            throw new Error('V1 Limit for data to max 1 item');
        }
        const dataUint8Array = [];

        this.data.forEach(item => { 
            // Consider data to text 
            const itemString = JSON.stringify(item);
            if(itemString.length > 127) {
                throw new Error('V1 Limit for data to max 127 characters');
            }
            const itemLengthUint8Array = varint.encodeVarInt(itemString.length, 'uint8array');
            const itemUint8Array = uint8array.fromString(itemString);
            dataUint8Array.push(...itemLengthUint8Array, ...itemUint8Array);
        });


        // Timelock
        const timelockStartAtUint8Array = varbigint.encodeVarBigInt(this.timelock.startAt, 'uint8array');
        const timelockEndAtUint8Array = varbigint.encodeVarBigInt(this.timelock.endAt, 'uint8array');

        // const authorizationsLengthUint8Array = varint.encodeVarInt(this.authorizations.length, 'uint8array');
        const authorizationsUint8Array = this.authorizations.toUint8Array();
        // this.authorizations.forEach(authorization => {
        //     const authorizationUint8Array = authorization.toUint8Array();
        //     authorizationsUint8Array.push(...authorizationUint8Array);
        // });

        let totalLength = 
        (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + timestampUint8Array.length
        + assetUint8Array.length + assetLengthUint8Array.length
        + inputsAmountUint8Array.length + inputsItemsUint8Array.length 
        + outputAmountUint8Array.length + outputRecipientLengthUint8Array.length + outputRecipientUint8Array.length 
        + stackLengthUint8Array.length + stackUint8Array.length
        + dataLengthUint8Array.length + dataUint8Array.length
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
        result.set(dataLengthUint8Array, offset); offset += dataLengthUint8Array.length;
        result.set(dataUint8Array, offset); offset += dataUint8Array.length;

        result.set(timelockStartAtUint8Array, offset); offset += timelockStartAtUint8Array.length;
        result.set(timelockEndAtUint8Array, offset); offset += timelockEndAtUint8Array.length;
        // result.set(timelockCreatedAtUint8Array, offset); offset += timelockCreatedAtUint8Array.length;

        if(options.excludeAuthorizations === false) {
            // result.set(authorizationsLengthUint8Array, offset); offset += authorizationsLengthUint8Array.length;
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }
        return result;
    }


    static fromUint8Array(inputArray) {
        let offset = 0;

        const {value: elementKind, length: elementKindBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindBytes;
        if(elementKind !== NET_KINDS['VOUCHER']) {
            throw new Error('Invalid element kind');
        }

        const kind = NET_KINDS_ARRAY[elementKind];

        const {value: version, length: versionBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += versionBytes;
        if(version !== 1) {
            throw new Error('Invalid version');
        }

        const {value: timestamp, length: timestampBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        offset += timestampBytes;

        const {value: assetLength, length: assetLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += assetLengthBytes;

        const asset = uint8array.toString(inputArray.subarray(offset, offset + assetLength));
        offset += assetLength;

        const {value: inputsAmount, length: inputsAmountBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += inputsAmountBytes;

        const inputs = [];
        for (let i = 0; i < inputsAmount; i++) {
            const {value: inputAmount, length: inputAmountBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
            offset += inputAmountBytes;

            const inputHashLength = varint.decodeVarInt(inputArray.subarray(offset));
            offset += inputHashLength.length
            const inputHash = uint8array.toHex(inputArray.subarray(offset, offset + inputHashLength.value));
            offset += inputHashLength.value;   

            inputs.push({ amount: BigInt(inputAmount), hash: inputHash });
        }
     
        
        const {value: outputAmount, length: outputAmountBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        offset += outputAmountBytes;

        const {value: outputRecipientLengthValue, length: outputRecipientLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += outputRecipientLengthBytes;

        const outputRecipient = inputArray.subarray(offset, offset + outputRecipientLengthValue);
        offset += outputRecipientLengthValue;

        const output = { amount: outputAmount, recipient: uint8array.toString(outputRecipient) };



        // Stack
        const {value: stackLength, length: stackLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += stackLengthBytes;
        const stack = [];
        for (let i = 0; i < stackLength; i++) {
            const {value: itemLength, length: itemLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
            offset += itemLengthBytes;
            const item = uint8array.toString(inputArray.subarray(offset, offset + itemLengthBytes));
            offset += itemLength;
            stack.push(item);
        }

        // Data
        const {value: dataLength, length: dataLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += dataLengthBytes;
        const data = [];
        for (let i = 0; i < dataLength; i++) {
            const {value: itemLength, length: itemLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
            offset += itemLengthBytes;
            const item = JSON.parse(uint8array.toString(inputArray.subarray(offset, offset + itemLength)));
            offset += itemLength;
            data.push(item);
        }

        // Timelock (each value var int)
        const {value: startAt, length: startAtBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        offset += startAtBytes;
        const {value: endAt, length: endAtBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        offset += endAtBytes;
        // const {value: createdAt, length: createdAtBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        // offset += createdAtBytes;
        const timelock = { startAt: BigInt(startAt), endAt: BigInt(endAt) };

        // let authorizations = null;
        //  const {value: authorizationsAmount, length: authorizationsAmountBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        // offset += authorizationsAmountBytes;
        const authBytes = inputArray.subarray(offset);
        let authorizations = Authorizations.fromUint8Array(authBytes);
        offset += authBytes.length;
        // for (let i = 0; i < authorizationsAmount; i++) {
        //     const authBytes = inputArray.subarray(offset);
        //     authorizations.push(Authorizations.fromUint8Array(authBytes));
        //     offset += authBytes.length;
        // }

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
        // const buffer = Buffer.from(hex, 'hex');
        // return Voucher.fromBuffer(buffer);
        return Voucher.fromUint8Array(uint8array.fromHex(hex));
    }

    computeHash() {
        const array = this.toUint8Array();
        const hash = sha256(array);
        return uint8array.toHex(hash);
    }

    toHash() {
        return this.computeHash();
    }

    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    toJSON({excludeAuthorizations = false} = {}) {
        const json = {
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
                startAt: this.timelock.startAt.toString(),
                endAt: this.timelock.endAt.toString(),
            },
        };

        if (!excludeAuthorizations) {
            // Auth.signature and Auth.publicKey are Uint8Arrays, we need to convert them to strings
            json.authorizations = this.authorizations.authorizations.map(auth => ({
                ...auth,
                signature: uint8array.toHex(auth.signature),
                publicKey: auth.publicKey ? uint8array.toHex(auth.publicKey) : ''
            }));
        }

        return json;
    }

    addAuthorization(authorization) {
        if(authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.addAuthorization(authorization);
    }

    verifyAuthorizations() {
        // return verifyDoc(this);
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
        // return signDoc(await this.toDoc(signer));
        this.authorizations.sign(this, signer);
        return this;
    }

    getPublicKey() {
        return this.authorizations?.[0]?.publicKey ? uint8array.toHex(this.authorizations[0].publicKey) : undefined;
    }

    validate() {
        if (!this.authorizations || this.authorizations.length === 0) {
            return {valid: false, error: 'Authorizations are required.'};
        }

        const signedAuthorizations = this.authorizations.authorizations.filter(auth => auth.signature);
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
        console.log('error', error);
        return valid;
    }

    isValidAtTime(currentTick) {
        if (!this.timelock) return true;
        return currentTick >= this.timelock.startAt && currentTick <= this.timelock.endAt;
    }

    getTotalInput() {
        return this.inputs.reduce((sum, input) => sum + BigInt(input.amount), 0n);
    }

    getTotalOutput() {
        return BigInt(this.output.amount);
    }
}

export default Voucher;

