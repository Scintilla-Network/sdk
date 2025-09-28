## Instruction

The Instruction class represents a message that is used to perform a specific action.

### Installation
```js
import { Instruction } from '@scintilla/ts-sdk';
```

### Initializing an Instruction
```typescript
const instruction = new Instruction({
    data: {
        asset: 'SCT',
        amount: 1000,
        recipient: 'scintilla',
    },
});
```

### Properties

- `data`: The data of the instruction.

### Methods

- `toUint8Array`: Converts the instruction to a Uint8Array.
- `toHex`: Converts the instruction to a hex string.
- `toHash`: Converts the instruction to a hash.
- `toJSON`: Converts the instruction to a JSON object.

### Static Methods

- `fromUint8Array`: Converts a Uint8Array to an instruction.
- `fromHex`: Converts a hex string to an instruction.
- `fromJSON`: Converts a JSON object to an instruction.


### Rules 

Packet defined as : 

| Field | Type | Description |
|-------|------|-------------|
| kind | variable-length integer | The kind of the instruction (kind = 21). |
| totalLength | variable-length integer | The total length of the instruction. |
| fieldsAmount | variable-length integer | The amount of fields in the data. |
| fieldsNames | [FieldName] | The names of the fields. |
| fieldsValues | [FieldValue] | The values of the fields. |

With FieldName defined as: 

| Field | Type | Description |
|-------|------|-------------|
| fieldNameLength | variable-length integer | The length of the field name. |
| fieldName | string | The name of the field. |

With FieldValue defined as: 

| Field | Type | Description |
|-------|------|-------------|
| fieldValueLength | variable-length integer | The length of the field value. |
| fieldValueType | variable-length integer | The type of the field value. (e.g. string, bigint, number, etc.)|
| fieldValue | string | The value of the field. |
