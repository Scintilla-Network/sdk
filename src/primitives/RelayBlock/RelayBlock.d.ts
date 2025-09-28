import { Buffer } from 'buffer';
import { RelayBlockHeader } from './RelayBlockHeader.js';
import {RelayBlockPayload} from "./RelayBlockPayload.js";
import { IRelayBlockOptions } from './interfaces/IRelayBlockOptions.js';
import {IRelayBlockSignature} from "./interfaces/IRelayBlockSignature.js";
import {ITransactionAuthorization} from "../Transaction/interfaces/ITransactionAuthorization.js";
import { SignableMessage } from '@scintilla-network/keys';

export declare class RelayBlock {
    header: RelayBlockHeader;
    payload: RelayBlockPayload;
    signatures: IRelayBlockSignature[];

    constructor(options?: IRelayBlockOptions);

    considerStateAction(stateAction: any): void;
    considerCluster(clusterMoniker: string, clusterHash: string): void;
    addSignature(signature: IRelayBlockSignature): void;
    toSignableMessage(options?: { excludeAuthorization?: boolean }): SignableMessage;
    verifySignature(): boolean;
    toUint8Array(options?: { excludeSignatures?: boolean }): Uint8Array;
    addAuthorization(authorization: ITransactionAuthorization): void;
    sign(signer: any): Promise<any>;
    toBuffer(options?: { excludeSignatures?: boolean }): Buffer;
    toHex(options?: { excludeSignatures?: boolean }): string;
    static fromBuffer(buffer: Buffer): RelayBlock;
    static fromHex(hex: string): RelayBlock;
    toJSON(options?: { excludeSignatures?: boolean }): object;
    toHash(encoding?: BufferEncoding, options?: { excludeSignatures?: boolean }): string | Buffer;
    toDoc(signer: any): any;
    validate(): {error: string, valid: boolean};
    isValid(): boolean;
}

export default RelayBlock;

