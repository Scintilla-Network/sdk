#### StateActionData

A StateActionData is a local primitives to hold any state action .data elements. 
This is mostly an helper to ensure proper serialization / deserialization of the state action data based on their types.

### Installation
```js
import { StateActionData } from '@scintilla/ts-sdk';
```

### Initializing a StateActionData
```typescript
const stateActionData = new StateActionData([
    {
        kind: 'INSTRUCTION',
        data: {
            asset: 'SCT',
            amount: 1000,
            recipient: 'scintilla',
        },
    },
]);
```

### Methods

- `toUint8Array()`: Converts the state action data to a Uint8Array.
- `toHex()`: Converts the state action data to a hex string.
- `toHash()`: Converts the state action data to a hash.
- `toJSON()`: Converts the state action data to a JSON object.

### Static Methods
- `fromUint8Array(dataArray)`: Converts a Uint8Array to a state action data.
- `fromHex(hex)`: Converts a hex string to a state action data.
- `fromJSON(json)`: Converts a JSON object to a state action data.

### Rules

Packet defined as:

| Field | Type | Description |
|-------|------|-------------|
| kind | variable-length integer | The kind of the state action data (kind = 22). |
| totalLength | variable-length integer | The total length of the state action data. |
| itemsAmount | variable-length integer | The amount of items in the state action data. |
| items | [StateActionItem] | The items of the state action data. |

With StateActionItem defined as:

| Field | Type | Description |
|-------|------|-------------|
| itemLength | variable-length integer | The length of the item. |
| item | item | The item of the state action data (start with a NET_KIND varint). |

