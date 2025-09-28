### Transfer

A transfer is a message that is used to transfer assets between accounts.

### Installation
```js
import { Transfer } from '@scintilla/ts-sdk';
```

### Initializing a Transfer
```typescript
const transfer = new Transfer({
            timestamp: 1234567890,
            cluster: 'core.banking',
            action: 'EXECUTE',
            type: 'ASSET',
            data: [{
                asset: 'SCT',
                amount: 300000 * 10 ** 8,
                recipient: 'tech-dao',
            }],
            sender: 'techdao',
            authorizations:[{
                moniker: 'alex',
                publicKey: '1234567890',
                signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
            },{
                moniker: 'bob',
                publicKey: '1234567890',
                signature: '500775d65ce45a4209fb584e6d16205b69e7e26fe84022ef455b90a5a8ab5914412cc87d7b6143991483b3bd3f71cf8bb89b055b2a3c6083046959af5eb9c2bd',
            }],
            fees: [{
                amount: 1000,
                asset: 'SCT',
                payer: 'alex',
            }],
        });
```

#### Properties

- `version`: The version of the transfer.
- `kind`: The kind of the transfer.
- `cluster`: The cluster of the transfer.
- `action`: The action of the transfer.
- `type`: The type of the transfer.
- `data`: The data of the transfer.
- `timestamp`: The timestamp of the transfer.
- `authorizations`: The authorizations of the transfer.
- `fees`: The fees of the transfer.
- `timelock`: The timelock of the transfer.

#### Methods

- `computeHash()`: Computes the hash of the transfer.
- `toBuffer()`: Converts the transfer to a buffer.
- `fromBuffer()`: Converts a buffer to a transfer.
- `toHex()`: Converts the transfer to a hex string.
- `toUint8Array()`: Converts the transfer to a uint8 array.
- `toHash()`: Converts the transfer to a hash.
- `toJSON()`: Converts the transfer to a JSON object.
- `verifySignature()`: Verifies the signature of the transfer.
- `getPublicKey()`: Gets the public key of the transfer.
- `toBase64()`: Converts the transfer to a base64 string.
- `toSignableMessage()`: Converts the transfer to a signable message.
- `toDoc()`: Converts the transfer to a doc.
- `sign()`: Signs the transfer.
- `validate()`: Validates the transfer.
- `isValid()`: Checks if the transfer is valid.
- `isValidAtTick()`: Checks if the transfer is valid at a given tick.