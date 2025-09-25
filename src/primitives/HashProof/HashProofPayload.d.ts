import { IHashProofPayloadElement } from "./interfaces/IHashProofPayloadElement.js";
import {IHashProofPayloadOptions} from "./interfaces/IHashProofPayloadOptions.js";

declare class HashProofPayload {
    public data: IHashProofPayloadElement[];
    private originalHashes?: string[]; // Store original hashes for merkle root verification
    
    constructor(options: IHashProofPayloadOptions);

    consider(element: IHashProofPayloadElement | null): void;
    private insertionSortByTimestamp(data: IHashProofPayloadElement[]): void;
    toBuffer(): Buffer;
    toHash(): string;
    static fromHex(hex: string): HashProofPayload | undefined;
    static fromBuffer(buffer: Buffer): HashProofPayload;
    toJSON(): { data: IHashProofPayloadElement[] };
    
    /**
     * Validates individual elements in the payload
     */
    private validateElements(): { valid: boolean, error?: string };
    
    /**
     * Validates timestamp ordering of elements
     */
    private validateTimestampOrdering(): { valid: boolean, error?: string };
    
    /**
     * Validates payload size constraints
     */
    private validateSize(): { valid: boolean, error?: string };
    
    /**
     * Computes the merkle root for the payload data
     */
    computeMerkleRoot(encoding?: BufferEncoding): { hash: string; proofs: any[]; } | null;
    
    /**
     * Verifies that the computed merkle root matches the expected one
     */
    verifyMerkleRoot(expectedRoot: string | null): { valid: boolean, error?: string };
    
    /**
     * Comprehensive payload validation
     */
    isValid(): { valid: boolean, error?: string };
    
    /**
     * Check if payload is empty
     */
    isEmpty(): boolean;
    
    /**
     * Get payload statistics
     */
    getStats(): { elementCount: number, size: number, types: Record<string, number> };
}

export default HashProofPayload;

