import { RelayBlockHeader } from './RelayBlockHeader.js';
import {RelayBlockPayload} from "./RelayBlockPayload.js";
import { IRelayBlockOptions } from './interfaces/IRelayBlockOptions.js';
import {IRelayBlockAuthorization} from "./interfaces/IRelayBlockAuthorization.js";
import {ITransactionAuthorization} from "../Transaction/interfaces/ITransactionAuthorization.js";
import { SignableMessage } from '@scintilla-network/keys';

export declare class RelayBlock {
    header: RelayBlockHeader;
    payload: RelayBlockPayload;
    authorizations: IRelayBlockSignature[];
    constructor(options?: IRelayBlockOptions);

    considerStateAction(stateAction: any): void;
    considerCluster(clusterMoniker: string, clusterHash: string): void;
    addAuthorization(authorization: IRelayBlockSignature): void;
    toSignableMessage(options?: { excludeAuthorization?: boolean }): SignableMessage;
    verifySignature(): boolean;
    toUint8Array(options?: { excludeAuthorizations?: boolean }): Uint8Array;
    addAuthorization(authorization: ITransactionAuthorization): void;
    sign(signer: any): Promise<any>;
    toUint8Array(options?: { excludeAuthorizations?: boolean }): Uint8Array;
    toHex(options?: { excludeAuthorizations?: boolean }): string;
    static fromUint8Array(uint8Array: Uint8Array): RelayBlock;
    static fromHex(hex: string): RelayBlock;
    toJSON(options?: { excludeAuthorizations?: boolean }): object;
    toHash(encoding?: 'uint8array' | 'hex', options?: { excludeAuthorizations?: boolean }): string | Uint8Array;
    toDoc(signer: any): any;
    validate(): {error: string, valid: boolean};
    isValid(): boolean;
}

export default RelayBlock;

