// src/models/interfaces/IFees.ts

export interface IFees {
    transfer: {
        percent: bigint;
        max: bigint;
    };
}
