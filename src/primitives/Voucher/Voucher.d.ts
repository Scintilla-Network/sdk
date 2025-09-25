import { 
    IVoucherOptions, 
    IVoucherInput, 
    IVoucherOutput, 
    IVoucherTimelock,
    IVoucherAuthorization 
} from './interfaces/IVoucherOptions.js';

export declare class Voucher {
    version: number;
    hash: string;
    asset: string;
    inputs: IVoucherInput[];
    output: IVoucherOutput;
    stack: any[];
    data: any[];
    timelock: IVoucherTimelock;
    authorizations: IVoucherAuthorization[];

    constructor(options?: IVoucherOptions);

    static fromJSON(json: any): Voucher;
    static fromBuffer(buffer: Buffer): Voucher;
    static fromHex(hex: string): Voucher;

    computeHash(): string;
    toBuffer(options?: { excludeAuthorization?: boolean }): Buffer;
    toHash(): string;
    toHex(): string;
    toUInt8Array(): Uint8Array;
    toJSON(options?: { excludeAuthorization?: boolean }): any;
    addAuthorization(authorization: IVoucherAuthorization): void;
    verifySignature(): boolean;
    toBase64(): string;
    toSignableMessage(): any;
    toDoc(signer: any): any;
    sign(signer: any): Promise<any>;
    getPublicKey(): string | undefined;
    validate(): { valid: boolean; error: string };
    isValid(): boolean;
    isValidAtTime(currentTick: bigint): boolean;
    getTotalInput(): bigint;
    getTotalOutput(): bigint;
}

export default Voucher;

