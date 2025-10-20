// src/primitives/Transaction/Transaction.d.ts
import { ITransactionOptions } from './interfaces/ITransactionOptions.js';
import {ITransactionAuthorization} from "./interfaces/ITransactionAuthorization.js";
import {ITransactionFee} from "./interfaces/ITransactionFee.js";
import { ITimelock } from "../TimeLock/interfaces/ITimeLock.js";

export declare class Transaction {
    version: number;
    kind: string;
    cluster: string | null;
    action: string | null;
    type: string | null;
    data: object;
    timestamp: number;
    authorizations: ITransactionAuthorization[];
    fees: ITransactionFee[];
    timelock: ITimelock;

    constructor(props?: ITransactionOptions);

    setTimelock(startTick: number, endTick: number): void;
    computeHash(): string;
    toBuffer(options?: { excludeAuthorization?: boolean }): Buffer;
    static fromBuffer(buffer: Buffer): Transaction;
    toHex(options?: { excludeAuthorization?: boolean }): string;
    toUint8Array(options?: { excludeAuthorization?: boolean }): Uint8Array;
    toHash(encoding?: 'hex' | 'uint8array', options?: { excludeAuthorization?: boolean }): string;
    toJSON(options?: { excludeAuthorization?: boolean }): object;
    addAuthorization(authorization: ITransactionAuthorization): void;
    verifySignature(): boolean;
    toBase64(): string;
    toSignableMessage(options?: { excludeAuthorization?: boolean }): any;
    toDoc(signer: any): any;
    sign(signer: any): Promise<any>;
    validate(): {error: string, valid: boolean};
    isValid(): boolean;
    isValidAtTick(currentTick: number): boolean;
}

export default Transaction;

