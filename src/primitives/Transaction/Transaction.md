### Transaction

A transaction is a message that is used to perform a specific action.

### Installation
```js
import { Transaction } from '@scintilla/ts-sdk';
```

### Initializing a Transaction
```typescript
const transaction = new Transaction({
    timestamp: 1758829635964n,
    cluster: 'core.banking',
    action: 'CREATE',
    type: 'ASSET',
    data: [new Asset({
        name: 'test',
        symbol: 'test',
        decimals: 18,
    })],
});
```

#### Properties

- `version`: The version of the transaction.
- `kind`: The kind of the transaction.
- `cluster`: The cluster of the transaction.
- `action`: The action of the transaction.
- `type`: The type of the transaction.
- `data`: The data of the transaction.
- `timestamp`: The timestamp of the transaction.
- `authorizations`: The authorizations of the transaction.
- `fees`: The fees of the transaction.
- `timelock`: The timelock of the transaction.

#### Methods

- `computeHash()`: Computes the hash of the transaction.
- `toBuffer()`: Converts the transaction to a buffer.
- `fromBuffer()`: Converts a buffer to a transaction.
- `toHex()`: Converts the transaction to a hex string.
- `toUInt8Array()`: Converts the transaction to a uint8 array.
- `toHash()`: Converts the transaction to a hash.
- `toJSON()`: Converts the transaction to a JSON object.
- `verifySignature()`: Verifies the signature of the transaction.
- `toBase64()`: Converts the transaction to a base64 string.
- `toSignableMessage()`: Converts the transaction to a signable message.
- `toDoc()`: Converts the transaction to a doc.
- `sign()`: Signs the transaction.
- `validate()`: Validates the transaction.
- `isValid()`: Checks if the transaction is valid.
- `isValidAtTick()`: Checks if the transaction is valid at a given tick.