
// Interface for the records structure
export interface IRecord {
    [key: string]: any;
}



// Specific to identity
export interface IIdentityRecord extends IRecord {
    moniker: string;
}
