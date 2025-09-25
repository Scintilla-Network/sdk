import { sha256  } from '@scintilla-network/hashes/classic';
import makeDoc from '../../utils/makeDoc.js';
import { uint8array, hex, varint, json, varbigint, utf8 } from '@scintilla-network/keys/utils';
const { decodeVarBigInt, encodeVarBigInt } = varbigint;
const { decodeVarInt, encodeVarInt } = varint;
import transformObjectNumbersToBigInt from '../../utils/transformObjectNumbersToBigInt.js';

// @ts-ignore
import { SignableMessage } from '@scintilla-network/keys';
import signDoc from '../../utils/signDoc.js';
import verifyDoc from '../../utils/verifyDoc.js';

import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Authorization } from '../Authorization/Authorization.js';

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
        this.authorizations = authorizations.map(auth => new Authorization(auth));
        // this.authorizations = 
        
        this.hash = hash ?? this.computeHash();
    }

    static fromJSON(json) {
        return new Voucher(json);
    }

    toUint8Array(options = {}) {
        if(options.excludeAuthorization === undefined) {
            options.excludeAuthorization = false;
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

        const authorizationsLengthUint8Array = varint.encodeVarInt(this.authorizations.length, 'uint8array');
        const authorizationsUint8Array = [];
        this.authorizations.forEach(authorization => {
            const authorizationUint8Array = authorization.toUint8Array();
            authorizationsUint8Array.push(...authorizationUint8Array);
        });

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
        + (options.excludeAuthorization ? 0 : authorizationsLengthUint8Array.length + authorizationsUint8Array.length);

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

        if(options.excludeAuthorization === false) {
            result.set(authorizationsLengthUint8Array, offset); offset += authorizationsLengthUint8Array.length;
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

        const authorizations = [];
        const {value: authorizationsAmount, length: authorizationsAmountBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += authorizationsAmountBytes;
        for (let i = 0; i < authorizationsAmount; i++) {
            const authorization = Authorization.fromUint8Array(inputArray.subarray(offset));
            offset += authorization.length;
            authorizations.push(authorization);
        }

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

    /**
     * @description Converts a Uint8Array to a Voucher
     * @param {Uint8Array} uint8Array 
     * @returns {Voucher}
     * @deprecated Use fromUint8Array instead
     */
    static fromBuffer(array) {
        throw new Error('fromBuffer is deprecated. Use fromUint8Array instead.');
        let offset = 0;

        // Version (1 byte)
        const version = array[offset];
        offset += 1;
        
        // Asset (3 bytes for 'sct')
        const asset = new TextDecoder().decode(array.subarray(offset, offset + 3));
        offset += 3;
        
        // Read inputs
        const inputsLength = array[offset];
        offset += 1;
        
        const inputs = [];
        for (let i = 0; i < inputsLength; i++) {
            // Read amount as BigInt from 8 bytes
            const amountBytes = array.subarray(offset, offset + 8);
            const amount = new DataView(amountBytes.buffer).getBigUint64(0, true);
            offset += 8;
            
            // Hash
            const hashLength = array[offset];
            offset += 1;
            const hash = new TextDecoder().decode(array.subarray(offset, offset + hashLength));
            offset += hashLength;
            
            inputs.push({ amount, hash });
        }
        // Output amount (8 bytes)
        const outputAmountBytes = array.subarray(offset, offset + 8);
        const outputAmount = new DataView(outputAmountBytes.buffer).getBigUint64(0, true);
        offset += 8;

        // Output recipient length and recipient
        const recipientLength = array[offset];
        offset += 1;
        const recipient = new TextDecoder().decode(array.subarray(offset, offset + recipientLength));
        offset += recipientLength;

        // Stack length and items
        const stackLength = array[offset];
        offset += 1;
        const stack = [];
        for (let i = 0; i < stackLength; i++) {
            const itemLength = array[offset];
            offset += 1;
            const item = new TextDecoder().decode(array.subarray(offset, offset + itemLength));
            offset += itemLength;
            stack.push(item);
        }

        // Data length and data
        const dataLength = array[offset];
        offset += 1;
        const data = JSON.parse(new TextDecoder().decode(array.subarray(offset, offset + dataLength)));
        offset += dataLength;

        // Timelock (24 bytes: 8 + 8 + 8)
        const startAtBytes = array.subarray(offset, offset + 8);
        const startAt = new DataView(startAtBytes.buffer).getBigUint64(0, true);
        offset += 8;
        const endAtBytes = array.subarray(offset, offset + 8);
        const endAt = new DataView(endAtBytes.buffer).getBigUint64(0, true);
        offset += 8;
        const createdAtBytes = array.subarray(offset, offset + 8);
        const createdAt = new DataView(createdAtBytes.buffer).getBigUint64(0, true);
        offset += 8;

        // Authorizations
        const authorizations = [];
        const authLength = array[offset];
        offset += 1;

        for (let i = 0; i < authLength; i++) {
            const authType = array[offset];
            let authorization = {};
            offset += 1;

            if(authType & 1){
                const sigLength = array[offset];
                offset += 1;
                const signature = array.subarray(offset, offset + sigLength);
                offset += sigLength;
                authorization.signature = signature;
            }
            if(authType & 2){
                const pubKeyLength = array[offset];
                offset += 1;
                const publicKey = array.subarray(offset, offset + pubKeyLength);
                offset += pubKeyLength;
                authorization.publicKey = publicKey;
            }
            if(authType & 4){
                const monikerLength = array[offset];
                offset += 1;
                const moniker = new TextDecoder().decode(array.subarray(offset, offset + monikerLength));
                offset += monikerLength;
                authorization.moniker = moniker;
            }
            if(authType & 8){
                const addressLength = array[offset];
                offset += 1;
                const address = new TextDecoder().decode(array.subarray(offset, offset + addressLength));
                offset += addressLength;
                authorization.address = address;
            }
            authorizations.push(authorization);
        }
        
        return new Voucher({
            version,
            timestamp,
            asset,
            inputs,
            output: {
                amount: outputAmount,
                recipient
            },
            stack,
            data,
            timelock: {
                startAt,
                endAt,
                createdAt
            },
            authorizations
        });
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

    
    /**
     * @deprecated Use toUint8Array instead
     */
    toBuffer({excludeAuthorization = false} = {}) {
        throw new Error('toBuffer is deprecated. Use toUint8Array instead.');
        const chunks = [];

        // Version (1 byte)
        const versionBuf = Buffer.alloc(1);
        versionBuf.writeUInt8(this.version);
        chunks.push(versionBuf);

        // Timestamp (8 bytes)
        const timestampBuf = Buffer.alloc(8);
        timestampBuf.writeBigUInt64LE(BigInt(this.timestamp));
        chunks.push(timestampBuf);

        // Asset (3 bytes for 'sct')
        const assetBuf = Buffer.from(this.asset);
        chunks.push(assetBuf);

        // Inputs array (1 byte for length)
        chunks.push(Buffer.from([this.inputs.length]));
        this.inputs.forEach(input => {
            // Amount (8 bytes)
            const amountBuf = Buffer.alloc(8);
            amountBuf.writeBigUInt64LE(BigInt(input.amount));
            chunks.push(amountBuf);
            
            // Hash length and hash
            const hashBuf = Buffer.from(input.hash || '');
            chunks.push(Buffer.from([hashBuf.length]));
            chunks.push(hashBuf);
        });
        
        // Output amount (8 bytes)
        const amountBuf = Buffer.alloc(8);
        amountBuf.writeBigUInt64LE(BigInt(this.output.amount));
        chunks.push(amountBuf);
        
        // Output recipient length (varint byte)
        chunks.push(varint.encodeVarInt(Buffer.from(this.output.recipient).length));
        // Output recipient (recipientLength bytes)
        chunks.push(Buffer.from(this.output.recipient));
        
        // Stack length (varint byte)
        chunks.push(varint.encodeVarInt(this.stack.length));

        // Stack (stackLength bytes)
        this.stack.forEach(item => {
            const itemBuf = Buffer.from(item);
            chunks.push(Buffer.from([itemBuf.length]));
            chunks.push(itemBuf);
        });

        const data = JSON.stringify(this.data);
        // Data length (varint byte)
        chunks.push(varint.encodeVarInt(data.length));
        // Data (dataLength bytes)
        chunks.push(Buffer.from(data));

        // Timelock (24 bytes: 8 + 8 + 8)
        const timelockBuf = Buffer.alloc(24);
        timelockBuf.writeBigUInt64LE(BigInt(this.timelock.startAt), 0);
        timelockBuf.writeBigUInt64LE(BigInt(this.timelock.endAt), 8);
        timelockBuf.writeBigUInt64LE(BigInt(this.timelock.createdAt), 16);
        chunks.push(timelockBuf);

        if(!excludeAuthorization){
            // Authorizations length (varint byte)
            chunks.push(varint.encodeVarInt(this.authorizations.length));
            // Authorizations (authorizationsLength bytes)
            this.authorizations.forEach(auth => {
                // Authorization type (1 byte for sig yes/no, 1 byte for pubkey yes/no, 1 byte for moniker yes/no, 1 byte for address yes/no)
                let authType = 0;
                if(auth.signature){
                    authType |= 1;
                }
                if(auth.publicKey){
                    authType |= 2;
                }
                if(auth.moniker){
                    authType |= 4;
                }
                if(auth.address){
                    authType |= 8;
                }

                chunks.push(Buffer.from([authType]));

                if(authType & 1){
                    // Signature (varint byte)
                    chunks.push(varint.encodeVarInt(auth.signature.length));
                    // Signature (signatureLength bytes)
                    chunks.push(Buffer.from(auth.signature));
                }
                if(authType & 2){
                    // Public key (varint byte)
                    chunks.push(varint.encodeVarInt(auth.publicKey?.length ?? 0));
                    // Public key (publicKeyLength bytes)
                    chunks.push(Buffer.from(auth.publicKey ?? new Uint8Array()));
                }
                // May be moniker
                if(authType & 4){
                    chunks.push(varint.encodeVarInt(auth.moniker?.length ?? 0));
                    chunks.push(Buffer.from(auth.moniker ?? ''));
                }
                // May be address
                if(authType & 8){
                    chunks.push(varint.encodeVarInt(auth.address?.length ?? 0));
                    chunks.push(Buffer.from(auth.address ?? ''));
                }
            });
        }
        
        return Buffer.concat(chunks);
    }

    toHash() {
        return this.computeHash();
    }

    toHex() {
        // return this.toBuffer().toString('hex');
        return uint8array.toHex(this.toUint8Array());
    }

    toJSON({excludeAuthorization = false} = {}) {
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

        if (!excludeAuthorization) {
            // Auth.signature and Auth.publicKey are Uint8Arrays, we need to convert them to strings
            json.authorizations = this.authorizations.map(auth => ({
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
        this.authorizations.push(authorization);
    }

    verifySignature() {
        return verifyDoc(this);
    }

    toBase64() {
        return this.toBuffer().toString('base64');
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
        return this.authorizations?.[0]?.publicKey ? uint8ArrayToHex(this.authorizations[0].publicKey) : undefined;
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

        if (!this.verifySignature()) {
            return {valid: false, error: 'Invalid signature.'};
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

