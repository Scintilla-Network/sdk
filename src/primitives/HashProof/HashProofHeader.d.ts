import { IHashProofHeaderOptions } from "./interfaces/IHashProofHeaderOptions.js";

declare class HashProofHeader {
    timestamp: number;
    height: number;
    previousHash: string | null;
    cluster: string;
    proposer: string | null;
    merkleRoot: string | null;
    nonce: bigint;
    difficulty: bigint;
    version: number;

    constructor(options?: IHashProofHeaderOptions);

    toBuffer(): Buffer;
    toHash(encoding?: BufferEncoding): string;
    toHex(): string;
    toJSON(): object;
    static fromBuffer(buffer: Buffer): HashProofHeader;
    isValid(): { valid: boolean, error?: string };
}

export default HashProofHeader;

