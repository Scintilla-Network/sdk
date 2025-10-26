// src/messages/NetMessage.d.ts
import { NET_KINDS } from "./NET_KINDS.js";
import { INetMessageOptions } from "./interfaces/INetMessageOptions.js";

export declare class NetMessage {
    static NET_KINDS: typeof NET_KINDS;
    chain: Uint8Array;
    kind: keyof typeof NET_KINDS;
    cluster: string;
    payload: Uint8Array | null;
    length: number;
    version: number;

    constructor(props?: INetMessageOptions);

    setPayload(payload: Uint8Array | null): void;
    toHex(): string;
    static fromHex(hex: string): NetMessage;
    toUint8Array(): Uint8Array;
    static fromUint8Array(uint8Array: Uint8Array): NetMessage;
    toHash(): string;
    getPayloadKind(): string;
    toPayloadKindInstance(): any;
    toUint8Array(): Uint8Array;
    static fromUint8Array(uint8Array: Uint8Array): NetMessage;
}

export default NetMessage;

