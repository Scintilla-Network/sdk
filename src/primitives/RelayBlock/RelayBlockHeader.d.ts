import {IRelayBlockHeaderOptions} from "./interfaces/IRelayBlockHeaderOptions.js";

export declare class RelayBlockHeader {
    timestamp: Date;
    epoch: number;
    previousHash: string | null;
    proposer: string | null;

    constructor(options?: IRelayBlockHeaderOptions);

    toUint8Array(): Uint8Array; 
    toHash(encoding?: 'uint8array' | 'hex'): string;
    static fromUint8Array(uint8Array: Uint8Array): RelayBlockHeader;
    toJSON(): object;
}

export default RelayBlockHeader;

