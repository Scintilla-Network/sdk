import { IRelayBlockPayloadOptions } from './interfaces/IRelayBlockPayloadOptions.js';

export declare class RelayBlockPayload {
    actions: any[]; // Array to hold Transition and other state actions
    clusters: { [key: string]: string }; // Map to hold clusterMoniker <> clusterHash

    constructor(options?: IRelayBlockPayloadOptions);

    considerStateAction(stateAction: any): void;
    considerCluster(clusterMoniker: string, clusterHash: string): void;
    toUint8Array(): Uint8Array;
    toHash(encoding?: 'uint8array' | 'hex'): string;
    static fromUint8Array(uint8Array: Uint8Array): RelayBlockPayload;
    toJSON(): object;
}

export default RelayBlockPayload;