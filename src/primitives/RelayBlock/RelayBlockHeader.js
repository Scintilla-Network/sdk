import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
import { utils } from '@scintilla-network/keys';
const { uint8array, varint } = utils;
const { decodeVarInt, encodeVarInt } = varint;

export class RelayBlockHeader {
    constructor(options = {}) {
        this.timestamp = options.timestamp ?? new Date();
        if(this.timestamp instanceof Date === false) this.timestamp = new Date(this.timestamp);
        this.epoch = options.epoch ?? 0;
        this.previousHash = options.previousHash ?? null;
        this.proposer = options.proposer ?? null;
    }

    toUint8Array() {
        const heightUint8Array = new Uint8Array(4);
        const heightView = new DataView(heightUint8Array.buffer);
        heightView.setInt32(0, this.epoch, false);

        const timestampUint8Array = new Uint8Array(8);
        const timestampView = new DataView(timestampUint8Array.buffer);
        timestampView.setBigInt64(0, BigInt(this.timestamp.getTime()), false);

        const previousHashUint8Array = this.previousHash ? uint8array.fromHex(this.previousHash) : new Uint8Array(32);
        const proposerUint8Array = this.proposer ? uint8array.fromString(this.proposer) : new Uint8Array(0);
        const proposerLengthUint8Array = encodeVarInt(proposerUint8Array.length);

        const totalLength = heightUint8Array.length + timestampUint8Array.length + previousHashUint8Array.length + proposerLengthUint8Array.length + proposerUint8Array.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        result.set(heightUint8Array, offset); offset += heightUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;
        result.set(previousHashUint8Array, offset); offset += previousHashUint8Array.length;
        result.set(proposerLengthUint8Array, offset); offset += proposerLengthUint8Array.length;
        result.set(proposerUint8Array, offset);
        
        return result;
    }

    toHash() {
        const uint8Array = this.toUint8Array();
        const hash = sha256(uint8Array);
        return uint8array.toHex(hash);
    }

    static fromUint8Array(uint8Array) {
        let offset = 0;

        const epochView = new DataView(uint8Array.buffer, uint8Array.byteOffset + offset, 4);
        const epoch = epochView.getInt32(0, false);
        offset += 4;

        const timestampView = new DataView(uint8Array.buffer, uint8Array.byteOffset + offset, 8);
        const timestamp = timestampView.getBigInt64(0, false);
        offset += 8;

        const previousHashEnd = offset + 32;
        const previousHashUint8Array = uint8Array.slice(offset, previousHashEnd);
        const previousHash = uint8array.toHex(previousHashUint8Array);
        offset = previousHashEnd;

        const { value: proposerLength, length: varIntLength } = decodeVarInt(uint8Array.slice(offset));
        offset += varIntLength;

        const proposerEnd = offset + Number(proposerLength);
        const proposerUint8Array = uint8Array.slice(offset, proposerEnd);
        const proposer = uint8array.toString(proposerUint8Array);

        return new RelayBlockHeader({
            timestamp: new Date(Number(timestamp)),
            epoch,
            previousHash: previousHash.length > 0 && !previousHash.match(/^0+$/) ? previousHash : null,
            proposer: proposer.length > 0 ? proposer : null,
        });
    }

    toJSON() {
        return {
            timestamp: this.timestamp,
            epoch: this.epoch,
            previousHash: this.previousHash,
            proposer: this.proposer,
        };
    }
}

export default RelayBlockHeader;

