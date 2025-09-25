export interface IClusterBlockHeaderOptions {
    version?: number;
    timestamp?: number;
    height?: number;
    previousHash?: string | null;
    proposer?: string | null;
    cluster?: string;
}
