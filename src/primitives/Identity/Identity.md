### Overview
The Identity class represents a unique entity with a moniker, address, and associated records. It is designed to manage and validate identity attributes and their related data in a structured manner. This class ensures the moniker adheres to specific character rules and provides functionality to manage nested records efficiently. It also includes serialization capabilities to facilitate storage and transmission.

#### Features
- Moniker Validation: Ensures monikers are alphanumeric, including hyphens and underscores, with a maximum length of 64 characters.
- Nested Records Management: Allows setting and getting nested records with dot-notation keys.
- Data Serialization: Supports converting the identity and its records to a structured store format and JSON.

#### Usage

#### Creating an Identity Instance

Instantiate an Identity object by optionally passing an options object with moniker, address, and records.

```typescript
import {Identity} from '@scintilla/ts-sdk';
const identity = new Identity({
    moniker: 'john_doe',
    address: '1A2B3C4D5E6F',
    records: {}
});
```

#### Setting and Getting Records
Add or update records using the set method with dot notation for nested paths. Retrieve them directly from the records property.

```typescript
identity.set('contact.email', 'john@example.com');
console.log(identity.records.contact.email); // Outputs: john@example.com
```

#### Serialization to Store

Convert the entire Identity instance, including its records, to a structured store format suitable for persistence.

```typescript
const store = identity.toStore();
console.log(store);
```

#### Serialization to JSON
Convert the Identity instance to JSON, which includes the moniker, address, and records.

```typescript
const json = identity.toJSON();
console.log(json);
```

### Methods
- constructor(options?: IIdentityOptions): Initializes a new Identity instance.
- set(key: string, value: any): Sets a value in the records object, supporting nested paths.
- toStore(): Converts the Identity instance and its records to a structured format for storage.
- toJSON(): Serializes the Identity instance to JSON.

Example:

```typescript
const identity = new Identity({
    moniker: 'jane_doe',
    address: '6G7H8I9J0K1L',
});

identity.set('profile.bio', 'An example user profile');
identity.set('contact.email', 'jane@example.com');

console.log(identity.toJSON());
// Outputs:
// {
//     moniker: 'jane_doe',
//     address: '6G7H8I9J0K1L',
//     records: {
//         profile: {
//             bio: 'An example user profile'
//         },
//         contact: {
//             email: 'jane@example.com'
//         }
//     }
// }
```


Advanced Usage

```js
'rules': {
                "clusters": {
                    "core.identity": {
                        "actions": {
                            // Allow every member of the DAO to create a proposal
                            'PROPOSAL_CREATE': [{
                                "type": "ALLOW",
                                "condition": {
                                    "all": [{
                                        "fact": "identity",
                                        "operator": "IN",
                                        "value": "members"
                                    }]
                                }
                            }]
                        },
                    }
                },
            },
```
