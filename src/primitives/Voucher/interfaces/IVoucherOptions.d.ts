export interface IVoucherInput {
    amount: bigint;
    hash?: string;
}

export interface IVoucherOutput {
    amount: bigint;
    recipient: string;
}

export interface IVoucherTimelock {
    startAt: bigint;
    endAt: bigint;
    createdAt: bigint;
}

export interface IVoucherAuthorization {
    signature: Uint8Array;
    publicKey?: Uint8Array;
    address?: string;
    moniker?: string;
}

export interface IVoucherOptions {
    version?: number;
    hash?: string;
    asset?: string;
    inputs?: IVoucherInput[];
    output?: IVoucherOutput;
    stack?: any[];
    data?: any[];
    timelock?: IVoucherTimelock;
    authorizations?: IVoucherAuthorization[];
} 