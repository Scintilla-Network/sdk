import { IIdentityOptions } from "./interfaces/IIdentityOptions.js";
import { IRecord,IIdentityRecord } from "./interfaces/IRecord.js";
import { IStore } from "./interfaces/IStore.js";
import {IIdentityMember, IIdentityMembers} from "./interfaces/IIdentityMember.js";

// Maximum length of a moniker is 64 characters
declare class Identity {
    parent: string | null;
    moniker: string;
    records: IRecord | IIdentityRecord;
    members: IIdentityMembers;

    constructor(options?: IIdentityOptions);

    private setMoniker(moniker?: string): string | undefined;
    public getMember(identifier: string): IIdentityMember | null;
    public setMember(member: IIdentityMember): void;
    public setRecord(key: string, value: any): void;
    public getFullMoniker(): string;
    public toStore(): IStore;
    public getMoniker(): string;
    public toJSON(): IIdentityOptions;
}

export default Identity;

