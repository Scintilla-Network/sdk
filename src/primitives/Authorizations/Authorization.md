# Authorization

An authorization is a message that is used to authorize a specific action.

## Installation

```js
import { Authorization } from '@scintilla-network/sdk';
```

## Initializing a Authorization 

```js
const authorization = new Authorization({
    signature: '0x1234567890abcdef',
    publicKey: '0x1234567890abcdef',
    moniker: 'test_moniker',
    address: '0x1234567890abcdef'
});
``` 

## Properties

- `signature`: The signature of the authorization.
- `publicKey`: The public key of the authorization.
- `moniker`: The moniker of the authorization.
- `address`: The address of the authorization.

## Methods

- `toUint8Array()`: Converts the authorization to a uint8 array.
- `toJSON()`: Converts the authorization to a JSON object.
- `toHash()`: Converts the authorization to a hash.
- `toBase64()`: Converts the authorization to a base64 string.
- `toSignableMessage()`: Converts the authorization to a signable message.
- `toDoc()`: Converts the authorization to a doc.
- `sign()`: Signs the authorization.
- `validate()`: Validates the authorization.
- `isValid()`: Checks if the authorization is valid.
- `isValidAtTick()`: Checks if the authorization is valid at a given tick.