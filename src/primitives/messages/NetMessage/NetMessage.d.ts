// src/messages/NetMessage.d.ts
import { Buffer } from 'buffer';
import { NET_KINDS } from "./NET_KINDS.js";
import { INetMessageOptions } from "./interfaces/INetMessageOptions.js";

export declare class NetMessage {
    static NET_KINDS: typeof NET_KINDS;
    chain: Buffer;
    kind: keyof typeof NET_KINDS;
    cluster: string;
    payload: Buffer | null;
    length: number;
    version: number;

    constructor(props?: INetMessageOptions);

    setPayload(payload: Buffer | null): void;
    toHex(): string;
    static fromHex(hex: string): NetMessage;
    toBuffer(): Buffer;
    static fromBuffer(buffer: Buffer): NetMessage;
    toHash(): string;
    getPayloadKind(): string;
    toPayloadKindInstance(): any;
    toUint8Array(): Uint8Array;
    static fromUint8Array(uint8Array: Uint8Array): NetMessage;
}

export default NetMessage;

