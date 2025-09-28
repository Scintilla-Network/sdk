import { sha256} from '@scintilla-network/hashes/classic';
import { uint8array, varint }  from '@scintilla-network/keys/utils';

export class ClusterBlockHeader {
    constructor(options = {}) {
        this.timestamp = options.timestamp ?? Date.now();
        this.height = options.height ?? 0;
        this.previousHash = options.previousHash ?? null;
        this.proposer = options.proposer ?? null;
        this.cluster = options.cluster ?? '';
        this.version = options.version ?? 1;
    }

    toUint8Array() {
        const versionUint8Array = new Uint8Array(4);
        const versionView = new DataView(versionUint8Array.buffer);
        versionView.setInt32(0, this.version, false);

        const heightUint8Array = new Uint8Array(4);
        const heightView = new DataView(heightUint8Array.buffer);
        heightView.setInt32(0, this.height, false);

        const timestampUint8Array = new Uint8Array(8);
        const timestampView = new DataView(timestampUint8Array.buffer);
        timestampView.setBigInt64(0, BigInt(this.timestamp), false);

        const previousHashUint8Array = this.previousHash ? uint8array.fromHex(this.previousHash) : new Uint8Array(32);

        const clusterUint8Array = uint8array.fromString(this.cluster);
        const varIntClusterLength = varint.encodeVarInt(clusterUint8Array.length);

        const proposerUint8Array = this.proposer ? uint8array.fromString(this.proposer) : new Uint8Array(0);
        const varIntProposerLength = this.proposer ? varint.encodeVarInt(proposerUint8Array.length) : new Uint8Array(0);

        const totalLength = versionUint8Array.length + heightUint8Array.length + timestampUint8Array.length + previousHashUint8Array.length + varIntClusterLength.length + clusterUint8Array.length + varIntProposerLength.length + proposerUint8Array.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(heightUint8Array, offset); offset += heightUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;
        result.set(previousHashUint8Array, offset); offset += previousHashUint8Array.length;
        result.set(varIntClusterLength, offset); offset += varIntClusterLength.length;
        result.set(clusterUint8Array, offset); offset += clusterUint8Array.length;
        result.set(varIntProposerLength, offset); offset += varIntProposerLength.length;
        result.set(proposerUint8Array, offset); offset += proposerUint8Array.length;
        
        return result;
    }

    toHash(encoding = 'hex') {
        const uint8Array = this.toUint8Array();
        const hash = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hash) : uint8array.toString(hash);
    }

    static fromUint8Array(uint8Array) {
        let offset = 0;

        const { value: version, length: versionLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += versionLength;

        const { value: height, length: heightLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += heightLength;

        const { value: timestamp, length: timestampLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += timestampLength;

        const previousHashUint8Array = uint8Array.slice(offset, offset + 32);
        const previousHash = uint8array.toHex(previousHashUint8Array);
        offset += 32;

        const { value: clusterLength, length: varIntClusterLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += varIntClusterLength;
        const clusterUint8Array = uint8Array.slice(offset, offset + clusterLength);
        const cluster = uint8array.toString(clusterUint8Array);
        offset += clusterLength;

        const { value: proposerLength, length: varIntProposerLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += varIntProposerLength;
        const proposerUint8Array = uint8Array.slice(offset, offset + proposerLength);
        const proposer = uint8array.toString(proposerUint8Array);

        return new ClusterBlockHeader({
            version: version,
            height,
            timestamp: BigInt(timestamp),
            previousHash: previousHash.length > 0 && !previousHash.match(/^0+$/) ? previousHash : null,
            cluster,
            proposer: proposer.length > 0 ? proposer : null
        });
    }

    toJSON() {
        return {
            version: this.version,
            timestamp: this.timestamp.toString(),
            height: this.height,
            previousHash: this.previousHash,
            proposer: this.proposer,
            cluster: this.cluster,
        };
    }
}

