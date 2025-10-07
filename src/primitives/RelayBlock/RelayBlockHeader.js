import { sha256 } from '@scintilla-network/hashes/classic';
import { uint8array, varint, varbigint } from '@scintilla-network/keys/utils';
import { serialize, deserialize } from '../../utils/index.js';

export class RelayBlockHeader {
    constructor(options = {}) {
        this.epoch = options.epoch ?? 0;
        this.timestamp = options.timestamp ? BigInt(options.timestamp) : BigInt(Date.now());
        this.previousHash = uint8array.toHex(new Uint8Array(32).fill(0));
        if(options?.previousHash) {
            this.previousHash = (options?.previousHash instanceof Uint8Array) ? uint8array.toHex(options?.previousHash) : options?.previousHash;
        }
        this.proposer = options.proposer ?? null;
    }

    toUint8Array() {
        // const heightUint8Array = varint.encodeVarInt(this.epoch, 'uint8array');
        const {value: epochUint8Array, length: epochLength} = serialize.fromVarInt(this.epoch, 'uint8array');
        
        // const timestampUint8Array = varbigint.encodeVarBigInt(this.timestamp, 'uint8array');
        const {value: timestampUint8Array, length: timestampLength} = serialize.fromVarBigInt(this.timestamp, 'uint8array');
        
        // const previousHashUint8Array = this.previousHash ? this.previousHash : new Uint8Array(32).fill(0);
        const {value: previousHashUint8Array, length: previousHashLength} = serialize.fromString(this.previousHash, 'uint8array');
        // const previousHashLength = previousHashUint8Array.length;


        // const proposerUint8Array = this.proposer ? uint8array.fromString(this.proposer) : new Uint8Array(0);
        // const proposerLengthUint8Array = varint.encodeVarInt(proposerUint8Array.length, 'uint8array');
        const {value: proposerUint8Array, length: proposerLength} = serialize.fromString(this.proposer, 'uint8array');

        const totalLength = 0
        + epochLength 
        + timestampLength 
        + previousHashLength
        + proposerLength;

        const result = new Uint8Array(totalLength);
        let offset = 0;

        // let result = new Uint8Array(totalLength);


        // const heightUint8Array = new Uint8Array(4);
        // const heightView = new DataView(heightUint8Array.buffer);
        // heightView.setInt32(0, this.epoch, false);

        // const timestampUint8Array = new Uint8Array(8);
        // const timestampView = new DataView(timestampUint8Array.buffer);
        // timestampView.setBigInt64(0, BigInt(this.timestamp.getTime()), false);

        // const previousHashUint8Array = this.previousHash ? uint8array.fromHex(this.previousHash) : new Uint8Array(32);
        // const proposerUint8Array = this.proposer ? uint8array.fromString(this.proposer) : new Uint8Array(0);
        // const proposerLengthUint8Array = encodeVarInt(proposerUint8Array.length);

        // const totalLength = heightUint8Array.length + timestampUint8Array.length + previousHashUint8Array.length + proposerLengthUint8Array.length + proposerUint8Array.length;
        // const result = new Uint8Array(totalLength);
        // let offset = 0;
        
        result.set(epochUint8Array, offset); offset += epochLength;
        result.set(timestampUint8Array, offset); offset += timestampLength;
        result.set(previousHashUint8Array, offset); offset += previousHashLength;
        result.set(proposerUint8Array, offset); offset += proposerLength;
        
        return result;
    }

    toHash() {
        const uint8Array = this.toUint8Array();
        const hash = sha256(uint8Array);
        return uint8array.toHex(hash);
    }

    static fromUint8Array(inputArray) {
        let offset = 0;
        const headerProps = {};

        const { value: epoch, length: epochLength } = deserialize.toVarInt(inputArray.subarray(offset));
        offset += epochLength;
        headerProps.epoch = epoch;

        const { value: timestamp, length: timestampLength } = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += timestampLength;
        headerProps.timestamp = timestamp;

        const { value: previousHash, length: previousHashLength } = deserialize.toString(inputArray.subarray(offset));
        offset += previousHashLength;
        headerProps.previousHash = previousHash;

        const { value: proposer, length: proposerLength } = deserialize.toString(inputArray.subarray(offset));
        offset += proposerLength;
        headerProps.proposer = proposer;

        // const epoch = varint.decodeVarInt(inputArray.subarray(offset));
        // offset += epoch.length;

        // const timestamp = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        // offset += timestamp.length;

        // const previousHashEnd = offset + 32; // 32 bytes for previous hash
        // const previousHashUint8Array = inputArray.subarray(offset, previousHashEnd);
        // offset = previousHashEnd;

        // const { value: proposerLength, length: varIntLength } = varint.decodeVarInt(inputArray.subarray(offset));
        // offset += varIntLength;

        // const proposerEnd = offset + proposerLength.value;
        // const proposerUint8Array = inputArray.subarray(offset, proposerEnd);
        // const proposer = uint8array.toString(proposerUint8Array);

        return new RelayBlockHeader(headerProps);
        // return new RelayBlockHeader({
        //     // epoch: epoch.value,
        //     // timestamp: BigInt(timestamp.value),
        //     // previousHash: previousHashUint8Array,
        //     // proposer: proposer.length > 0 ? proposer : null,
        //     ...headerProps,
        // });
    }


    static fromJSON(json) {
        return new RelayBlockHeader({
            epoch: json.epoch,
            timestamp: BigInt(json.timestamp),
            previousHash: uint8array.fromHex(json.previousHash),
            proposer: json.proposer,
        });
    }

    toJSON() {
        return {
            epoch: this.epoch,
            timestamp: this.timestamp,
            previousHash: uint8array.toHex(this.previousHash),
            proposer: this.proposer,
        };
    }
}

export default RelayBlockHeader;

