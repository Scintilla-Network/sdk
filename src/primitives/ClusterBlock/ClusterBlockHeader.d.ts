import { Buffer } from 'buffer';
import { IClusterBlockHeaderOptions } from './interfaces/IClusterBlockHeaderOptions.js';

export declare class ClusterBlockHeader {
    timestamp: number;
    height: number;
    previousHash: string | null;
    proposer: string | null;
    cluster: string;
    version: number;

    constructor(options?: IClusterBlockHeaderOptions);

    toBuffer(): Buffer;
    toHash(encoding?: BufferEncoding): string;
    static fromBuffer(buffer: Buffer): ClusterBlockHeader;
    toJSON(): object;
}

