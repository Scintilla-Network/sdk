// src/primitives/Transition/Transition.d.ts
import {ITransitionOptions} from "./interfaces/ITransitionOptions.js";
import {ITransitionAuthorization} from "./interfaces/ITransitionAuthorization.js";
import {ITransitionFee} from "./interfaces/ITransitionFee.js";
import {ITransactionAuthorization} from "../Transaction/interfaces/ITransactionAuthorization.js";
import { ITimelock } from '../../../types/TimeLock/interfaces/ITimeLock.js';

export declare class Transition {
    version: number;
    kind: string;
    cluster: string | null;
    action: string | null;
    type: string | null;
    data: object;
    timestamp: number;
    authorizations: ITransitionAuthorization[];
    fees: ITransitionFee[];
    timelock?: ITimelock;

    constructor(props?: ITransitionOptions);

    computeHash(): string;
    toBuffer(options?: { excludeAuthorization?: boolean }): Buffer;
    static fromBuffer(buffer: Buffer): Transition;
    toHex(options?: { excludeAuthorization?: boolean }): string;
    toUint8Array(options?: { excludeAuthorization?: boolean }): Uint8Array;
    toHash(encoding?: BufferEncoding, options?: { excludeAuthorization?: boolean }): string;
    toJSON(options?: { excludeAuthorization?: boolean }): object;
    addAuthorization(authorization: ITransactionAuthorization): void;
    verifySignature(): boolean;
    toBase64(): string;
    toSignableMessage(): any;
    toDoc(signer: any): any;
    sign(signer: any): Promise<any>;
    getPublicKey(): string | undefined;
    validate(): {error: string, valid: boolean};
    isValid(): boolean;
    isValidAtTick(currentTick: number): boolean;
}

export default Transition;

