// Interface for the options passed to the Identity constructor
import {IRecord} from "./IRecord.js";
import {IIdentityMembers} from "./IIdentityMember.js";

export interface IIdentityOptions {
    parent?: string | null;
    moniker?: string;
    members?: IIdentityMembers;
    records?: IRecord;
}
