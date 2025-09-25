import {ClusterBlockPayload} from "./ClusterBlockPayload.js";
import {ClusterBlockHeader} from "./ClusterBlockHeader.js";
import {IClusterBlockOptions} from "./interfaces/IClusterBlockOptions.js";
import {IClusterBlockAuthorization} from "./interfaces/IClusterBlockAuthorization.js";
import { SignableMessage } from "@scintilla-network/keys";

interface IStateAction {
    kind: string;
    type: string;
    data: any;
    timestamp: number;
}

interface IElement {
    header: {
        cluster: string;
    };
    payload: {
        data: IStateAction[];
    };
    toHash: (encoding: BufferEncoding) => string;
}

export default class ClusterBlock {
    header: ClusterBlockHeader;
    payload: ClusterBlockPayload;
    authorizations: IClusterBlockAuthorization[];

    constructor(options?: IClusterBlockOptions);

    consider(element: IElement): boolean;
    toBuffer(options?: { excludeAuthorization?: boolean }): Buffer;
    toHex(options?: { excludeAuthorization?: boolean }): string;
    static fromHex(hex: string): ClusterBlock;
    static fromBuffer(buffer: Buffer): ClusterBlock;
    toString(): string;
    toHash(encoding?: BufferEncoding): string | Buffer;
    toJSON(): object;
    isFrozen(): boolean;
    isOpen(): boolean;
    isVoting(): boolean;
    toDoc(signer: any): any;
    toSignableMessage(options?: { excludeAuthorization?: boolean }): SignableMessage;
    toUInt8Array(options?: { excludeAuthorization?: boolean }): Uint8Array;
    addAuthorization(authorization: IClusterBlockAuthorization): void;
    sign(signer: any): Promise<any>;
    verifySignatures(): boolean;
    validate(): {error: string, valid: boolean};
    isValid(): boolean;
}

