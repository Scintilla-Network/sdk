import { Buffer } from 'buffer';
import { IRelayBlockPayloadOptions } from './interfaces/IRelayBlockPayloadOptions.js';

export declare class RelayBlockPayload {
    actions: any[]; // Array to hold Transition and other state actions
    clusters: { [key: string]: string }; // Map to hold clusterMoniker <> clusterHash

    constructor(options?: IRelayBlockPayloadOptions);

    considerStateAction(stateAction: any): void;
    considerCluster(clusterMoniker: string, clusterHash: string): void;
    toBuffer(): Buffer;
    toHash(): string;
    static fromBuffer(buffer: Buffer): RelayBlockPayload;
    toJSON(): object;
}

export default RelayBlockPayload;

