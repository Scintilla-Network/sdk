import { ITimelock } from "../../TimeLock/interfaces/ITimeLock.js";
import {ITransitionAuthorization} from "./ITransitionAuthorization.js";
import {ITransitionFee} from "./ITransitionFee.js";

export interface ITransitionOptions {
    version?: number;
    cluster?: string;
    action?: string;
    type?: string;
    data?: object;
    timestamp?: number;

    authorizations?: ITransitionAuthorization[] | [];
    fees?: ITransitionFee[] | [];

    timelock? : ITimelock;

}
