import { sha256 } from '@scintilla-network/hashes/classic';
import { uint8array, varint } from '@scintilla-network/keys/utils';

class HashProofHeader {
    constructor(options = {}) {
        this.timestamp = options.timestamp ? BigInt(options.timestamp) : BigInt(Date.now());
        this.height = options.height ?? 0;
        this.previousHash = options.previousHash ?? null;
        this.proposer = options.proposer ?? null;
        this.merkleRoot = options.merkleRoot ?? null;
        this.nonce = BigInt(options.nonce ?? 0n);
        this.difficulty = options.difficulty ?? 0n;  
        this.version = options.version ?? 1;
    }


    static fromUint8Array(uint8Array) {
        let offset = 0;

        // Version - decode from varint
        const { value: version, length: versionLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += versionLength;

        // Height - decode from varint
        const { value: height, length: heightLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += heightLength;

        // Timestamp - decode from varint
        const { value: timestamp, length: timestampLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += timestampLength;

        // Previous hash - fixed 32 bytes
        const previousHashUint8Array = uint8Array.slice(offset, offset + 32);
        const previousHash = uint8array.toHex(previousHashUint8Array);
        offset += 32;

        // Cluster - varint length + string data
        const { value: clusterLength, length: clusterLengthBytes } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += clusterLengthBytes;
        const clusterUint8Array = uint8Array.slice(offset, offset + Number(clusterLength));
        const cluster = uint8array.toString(clusterUint8Array);
        offset += Number(clusterLength);

        // Proposer - varint length + string data
        const { value: proposerLength, length: proposerLengthBytes } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += proposerLengthBytes;
        const proposerUint8Array = uint8Array.slice(offset, offset + Number(proposerLength));
        const proposer = uint8array.toString(proposerUint8Array);
        offset += Number(proposerLength);

        // Merkle root - fixed 32 bytes
        const merkleRootUint8Array = uint8Array.slice(offset, offset + 32);
        const merkleRoot = uint8array.toHex(merkleRootUint8Array);
        offset += 32;

        // Nonce - decode from varint
        const { value: nonce, length: nonceLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += nonceLength;

        // Difficulty - decode from varint
        const { value: difficulty, length: difficultyLength } = varint.decodeVarInt(uint8Array.slice(offset));
        offset += difficultyLength;

        const blockHeader = new HashProofHeader({
            version: Number(version),
            height: Number(height),
            timestamp: Number(timestamp),
            previousHash: previousHash.match(/^0+$/) ? null : previousHash,
            cluster,
            proposer: proposerLength === 0 ? null : proposer,
            merkleRoot: merkleRoot.match(/^0+$/) ? null : merkleRoot,
            nonce: BigInt(nonce),
            difficulty: BigInt(difficulty)
        });

        return blockHeader;
    }

    toUint8Array() {
        // Version - use varint instead of fixed 4 bytes
        const versionUint8Array = varint.encodeVarInt(this.version);

        // Height - use varint instead of fixed 4 bytes
        const heightUint8Array = varint.encodeVarInt(this.height);

        // Timestamp - use varint for consistency, ensure it's a number
        const timestampUint8Array = varint.encodeVarInt(Number(this.timestamp));

        // Previous hash - fixed 32 bytes, null becomes all zeros
        const previousHashUint8Array = this.previousHash ? uint8array.fromHex(this.previousHash) : new Uint8Array(32);
        
        // Cluster - use varint for length
        const clusterUint8Array = uint8array.fromString(this.cluster);
        const clusterLengthUint8Array = varint.encodeVarInt(clusterUint8Array.length);

        // Proposer - use varint for length, can be empty
        const proposerUint8Array = this.proposer ? uint8array.fromString(this.proposer) : new Uint8Array(0);
        const proposerLengthUint8Array = varint.encodeVarInt(proposerUint8Array.length);

        // Merkle root - fixed 32 bytes, null becomes all zeros
        const merkleRootUint8Array = this.merkleRoot ? uint8array.fromHex(this.merkleRoot) : new Uint8Array(32);

        // Nonce - convert BigInt to Number for varint
        const nonceUint8Array = varint.encodeVarInt(Number(this.nonce));

        // Difficulty - convert BigInt to Number for varint
        const difficultyUint8Array = varint.encodeVarInt(Number(this.difficulty));

        const totalLength = versionUint8Array.length + heightUint8Array.length + timestampUint8Array.length 
            + previousHashUint8Array.length + clusterLengthUint8Array.length + clusterUint8Array.length 
            + proposerLengthUint8Array.length + proposerUint8Array.length + merkleRootUint8Array.length 
            + nonceUint8Array.length + difficultyUint8Array.length;

        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(heightUint8Array, offset); offset += heightUint8Array.length;
        result.set(timestampUint8Array, offset); offset += timestampUint8Array.length;
        result.set(previousHashUint8Array, offset); offset += previousHashUint8Array.length;
        result.set(clusterLengthUint8Array, offset); offset += clusterLengthUint8Array.length;
        result.set(clusterUint8Array, offset); offset += clusterUint8Array.length;
        result.set(proposerLengthUint8Array, offset); offset += proposerLengthUint8Array.length;
        result.set(proposerUint8Array, offset); offset += proposerUint8Array.length;
        result.set(merkleRootUint8Array, offset); offset += merkleRootUint8Array.length;
        result.set(nonceUint8Array, offset); offset += nonceUint8Array.length;
        result.set(difficultyUint8Array, offset);
        
        return result;
    }

    toHash(encoding = 'uint8array') {
        const uint8Array = this.toUint8Array();
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    toJSON() {
        return {
            version: this.version,
            timestamp: this.timestamp.toString(),
            height: this.height,
            previousHash: this.previousHash,
            cluster: this.cluster,
            proposer: this.proposer,
            merkleRoot: this.merkleRoot,
            nonce: this.nonce.toString(),
            difficulty: this.difficulty.toString()
        };
    }

    isValid() {
        // Version validation
        if (!Number.isInteger(this.version) || this.version < 1) {
            return { valid: false, error: 'Invalid version: must be a positive integer' };
        }

        // Height validation  
        if (!Number.isInteger(this.height) || this.height < 0) {
            return { valid: false, error: 'Invalid height: must be a non-negative integer' };
        }

        // Timestamp validation
        if (!Number.isInteger(this.timestamp) || this.timestamp <= 0) {
            return { valid: false, error: 'Invalid timestamp: must be a positive integer' };
        }

        // Check if timestamp is reasonable (not too far in the past or future)
        const now = Date.now();
        const maxPastTime = now - (24 * 60 * 60 * 1000); // 24 hours ago
        const maxFutureTime = now + (2 * 60 * 60 * 1000); // 2 hours in the future
        
        if (this.timestamp < maxPastTime) {
            return { valid: false, error: 'Timestamp too far in the past (more than 24 hours)' };
        }
        
        if (this.timestamp > maxFutureTime) {
            return { valid: false, error: 'Timestamp too far in the future (more than 2 hours)' };
        }

        // Cluster validation
        if (!this.cluster || typeof this.cluster !== 'string' || this.cluster.trim() === '') {
            return { valid: false, error: 'Cluster is required and must be a non-empty string' };
        }

        // Cluster format validation (assuming cluster format like "community.unknown")
        if (!this.cluster.includes('.') || this.cluster.split('.').length < 2) {
            return { valid: false, error: 'Invalid cluster format: expected format like "community.unknown"' };
        }

        // Previous hash validation
        if (this.height === 0) {
            // Genesis block should have no previous hash
            if (this.previousHash !== null) {
                return { valid: false, error: 'Genesis block (height 0) must have null previousHash' };
            }
        } else {
            // Non-genesis blocks must have a previous hash
            if (this.previousHash === null) {
                return { valid: false, error: 'Non-genesis block must have a previousHash' };
            }
            
            // Previous hash format validation (64 character hex string)
            if (typeof this.previousHash !== 'string' || !/^[0-9a-fA-F]{64}$/.test(this.previousHash)) {
                return { valid: false, error: 'Invalid previousHash: must be a 64-character hexadecimal string' };
            }
        }

        // Proposer validation - required for mined blocks
        if (this.proposer !== null && (typeof this.proposer !== 'string' || this.proposer.trim() === '')) {
            return { valid: false, error: 'Proposer must be null or a non-empty string' };
        }

        // Merkle root validation
        if (this.merkleRoot !== null) {
            if (typeof this.merkleRoot !== 'string' || !/^[0-9a-fA-F]{64}$/.test(this.merkleRoot)) {
                return { valid: false, error: 'Invalid merkleRoot: must be null or a 64-character hexadecimal string' };
            }
        }

        // Nonce validation
        if (typeof this.nonce !== 'bigint' || this.nonce < 0n) {
            return { valid: false, error: 'Invalid nonce: must be a non-negative bigint' };
        }

        // Difficulty validation
        if (typeof BigInt(this.difficulty) !== 'bigint' || BigInt(this.difficulty) <= 0n) {
            return { valid: false, error: 'Invalid difficulty: must be a positive bigint' };
        }

        // Difficulty range validation
        const maxDifficulty = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
        if (this.difficulty > maxDifficulty) {
            return { valid: false, error: 'Difficulty exceeds maximum allowed value' };
        }

        return { valid: true };
    }
}

export default HashProofHeader;

