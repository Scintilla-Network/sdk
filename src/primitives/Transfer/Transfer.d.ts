import {ITransferOptions} from "./interfaces/ITransferOptions.js";
import {ITransferAuthorization} from "./interfaces/ITransferAuthorization.js";
import {ITransferFee} from "./interfaces/ITransferFee.js";
import {ITransactionAuthorization} from "../Transaction/interfaces/ITransactionAuthorization.js";
import { ITimelock } from '../../../types/TimeLock/interfaces/ITimeLock.js';

export declare class Transfer {
    version: number;
    kind: string;
    cluster: string | null;
    action: string | null;
    type: string | null;
    data: object;
    timestamp: number;
    sender?: string | null;
    authorizations: ITransferAuthorization[];
    fees: ITransferFee[];
    timelock?: ITimelock;

    constructor(props?: ITransferOptions);

    computeHash(): string;
    toBuffer(options?: { excludeAuthorization?: boolean }): Buffer;
    static fromBuffer(buffer: Buffer): Transfer;
    toHex(options?: { excludeAuthorization?: boolean }): string;
    toUint8Array(options?: { excludeAuthorization?: boolean }): Uint8Array;
    toHash(encoding?: BufferEncoding, options?: { excludeAuthorization?: boolean }): string;
    toJSON(options?: { excludeAuthorization?: boolean }): object;
    verifySignature(): boolean;
    getPublicKey(): string | undefined;
    toBase64(): string;
    addAuthorization(authorization: ITransactionAuthorization): void;
    toSignableMessage(options?: { excludeAuthorization?: boolean }): any;
    toDoc(signer: any): any;
    sign(signer: any): Promise<any>;
    validate(): {error: string, valid: boolean};
    isValid(): boolean;
    isValidAtTick(currentTick: number): boolean;
}

export default Transfer;

