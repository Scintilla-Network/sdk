// src/primitives/Transfer/interfaces/TransferOptions.ts
import { ITimelock } from "../../TimeLock/interfaces/ITimeLock.js";
import {ITransferAuthorization} from "./ITransferAuthorization.js";
import {ITransferFee} from "./ITransferFee.js";

export interface ITransferOptions {
    version?: number;
    cluster?: string | null;
    action?: string;
    type?: string;
    data?: object;
    timestamp?: number;
    sender?: string | null;

    authorizations?: ITransferAuthorization[] | null;
    fees?: ITransferFee[] | null;
    
    timelock? : ITimelock;
}
