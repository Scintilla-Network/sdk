import { ITimelock } from "../../TimeLock/interfaces/ITimeLock.js";
import {ITransactionAuthorization} from "./ITransactionAuthorization.js";
import {ITransactionFee} from "./ITransactionFee.js";

export interface ITransactionOptions {
    version?: number;
    cluster?: string;
    action?: string;
    type?: string;
    data?: object;
    timestamp?: number;

    authorizations?: ITransactionAuthorization[] | [];
    fees?: ITransactionFee[] | [];

    timelock? : ITimelock;

}
