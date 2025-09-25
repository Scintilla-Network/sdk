export interface IHashProofHeaderOptions {
    version?: number;
    timestamp?: number;
    height?: number;
    previousHash?: string | null;
    cluster?: string;
    proposer?: string | null;
    merkleRoot?: string | null;
    nonce?: bigint;
    difficulty?: bigint;
}
