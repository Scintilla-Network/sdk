
// Interface for the keychain records structure
export interface IKeychainRecord {
    [key: string]: any;
}



// Specific to identity
export interface IIdentityKeychainRecord extends IKeychainRecord {
    moniker?: string;
    address?: string;
    key?: string;
}
