import { IClusterBlockHeaderOptions } from './interfaces/IClusterBlockHeaderOptions.js';

export declare class ClusterBlockHeader {
    timestamp: number;
    height: number;
    previousHash: string | null;
    proposer: string | null;
    cluster: string;
    version: number;

    constructor(options?: IClusterBlockHeaderOptions);

    toUint8Array(): Uint8Array;
    toHash(encoding?: 'uint8array' | 'hex'): string;
    static fromUint8Array(uint8Array: Uint8Array): ClusterBlockHeader;
    toJSON(): object;
}

