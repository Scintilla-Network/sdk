import { Buffer } from 'buffer';
import {IRelayBlockHeaderOptions} from "./interfaces/IRelayBlockHeaderOptions.js";

export declare class RelayBlockHeader {
    timestamp: Date;
    epoch: number;
    previousHash: string | null;
    proposer: string | null;

    constructor(options?: IRelayBlockHeaderOptions);

    toBuffer(): Buffer;
    toHash(): string;
    static fromBuffer(buffer: Buffer): RelayBlockHeader;
    toJSON(): object;
}

export default RelayBlockHeader;

