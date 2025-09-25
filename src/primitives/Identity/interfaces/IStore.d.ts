import { IRecord, IIdentityRecord } from "./IRecord.js";

// Interface for the structure returned by toStore method
export interface IStore {
    [path: string]: IRecord | IIdentityRecord;
}
