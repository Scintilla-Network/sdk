import { NET_KINDS } from '../NET_KINDS.js';

export interface INetMessageOptions {
    version?: number;
    cluster?: string | null;
    chain?: Uint8Array;
    kind?: keyof typeof NET_KINDS;
    payload?: Uint8Array | null;
}
