# toArray

## Overview
The `toArray` function deserializes byte data back into JavaScript arrays following the Scintilla Network protocol specification. It reverses the process performed by `serialize.fromArray()`.

## Protocol Structure

### Expected Byte Layout
```
[KIND][ITEMS_COUNT][ITEM_1][ITEM_2]...[ITEM_N]
```

### Field Specifications

#### 1. KIND (1 byte)
- **Expected Value**: `0x18` (24 decimal)
- **Constant**: `NET_KINDS.PACKEDARRAY`
- **Validation**: Must match expected kind or throw error

#### 2. ITEMS_COUNT (Variable length)
- **Format**: VarInt encoding
- **Purpose**: Number of items in the array
- **Range**: 0 to 2^63-1

#### 3. ITEMS (Variable length each)
Each item follows this structure:
```
[TYPE_BYTE][SERIALIZED_VALUE]
```

### Type Byte Mappings
| Hex Value | Type | Description |
|-----------|------|-------------|
| 0x50 | String | UTF-8 encoded string |
| 0x51 | VarInt | Variable-length integer |
| 0x52 | BigInt | Variable-length big integer |
| 0x53 | Array | Nested array (recursive) |
| 0x54 | Object | Nested object |
| Other | Primitive | NET_KINDS primitive object |

### Item Deserialization Rules

#### String Items (0x50)
- **Format**: `[0x50][LENGTH_VARINT][UTF8_BYTES]`
- **Deserialization**: Call `toString(bytes)`
- **Returns**: JavaScript string

#### VarInt Items (0x51)
- **Format**: `[0x51][VARINT_BYTES]`
- **Deserialization**: Call `toVarInt(bytes)`
- **Returns**: JavaScript number

#### BigInt Items (0x52)
- **Format**: `[0x52][VARBIGINT_BYTES]`
- **Deserialization**: Call `toVarBigInt(bytes)`
- **Returns**: JavaScript BigInt

#### Array Items (0x53)
- **Format**: `[0x53][NESTED_ARRAY_BYTES]`
- **Deserialization**: Recursive call to `toArray(bytes)`
- **Returns**: JavaScript array

#### Object Items (0x54)
- **Format**: `[0x54][NESTED_OBJECT_BYTES]`
- **Deserialization**: Call `toObject(bytes)`
- **Returns**: JavaScript object

#### Primitive Objects (Other types)
- **Condition**: Type byte matches a NET_KINDS value
- **Process**: 
  1. Look up constructor using `kindToConstructor()`
  2. Call `constructor.fromUint8Array(bytes)`
  3. Adjust offset by object's byte length
- **Returns**: Primitive object instance

## Deserialization Process

1. **Validate Kind**: Check first byte matches PACKEDARRAY kind
2. **Read Item Count**: Decode VarInt for number of items
3. **Process Items**: For each item:
   - Read type byte
   - Determine deserialization method
   - Deserialize value
   - Update byte offset
4. **Return Result**: Array of deserialized items

## Examples

### Simple Array
```javascript
Input bytes: [0x18, 0x03, 0x51, 0x01, 0x50, 0x05, 0x68, 0x65, 0x6C, 0x6C, 0x6F, 0x52, 0x2A]
Output: [1, "hello", 42n]
```

Breakdown:
- `0x18`: PACKEDARRAY kind ✓
- `0x03`: 3 items
- `0x51 0x01`: VarInt type, value 1
- `0x50 0x05 0x68...0x6F`: String type, "hello"
- `0x52 0x2A`: BigInt type, value 42n

### Nested Array
```javascript
Input bytes: [0x18, 0x02, 0x51, 0x01, 0x53, 0x18, 0x02, 0x51, 0x02, 0x51, 0x03]
Output: [1, [2, 3]]
```

Breakdown:
- `0x18`: PACKEDARRAY kind ✓
- `0x02`: 2 items
- `0x51 0x01`: First item: VarInt 1
- `0x53`: Second item: Array type
- `0x18 0x02 0x51 0x02 0x51 0x03`: Nested array [2, 3]

### Mixed Type Array
```javascript
Input bytes: [0x18, 0x04, 0x51, 0x0A, 0x50, 0x04, 0x74, 0x65, 0x73, 0x74, 0x52, 0x64, 0x54, ...]
Output: [10, "test", 100n, {...}]
```

## Error Conditions

### Invalid Kind
```javascript
// If first byte is not 0x18
throw new Error(`Invalid kind: ${kind} - Expected: PACKEDARRAY`);
```

### Unsupported Field Type
```javascript
// If type byte is not recognized
throw new Error(`Unsupported field type ${fieldType}`);
```

### Missing Constructor
```javascript
// If primitive type has no registered constructor
throw new Error(`Unsupported field type ${fieldType}`);
```

### Insufficient Data
- Truncated byte arrays will cause parsing errors
- VarInt/VarBigInt decoding failures
- String length mismatches

## Return Value

```javascript
{
    value: Array,    // Deserialized JavaScript array
    length: number   // Total bytes consumed during deserialization
}
```

## Usage
```javascript
import { toArray } from './toArray.js';

const bytes = new Uint8Array([0x18, 0x02, 0x51, 0x01, 0x50, 0x04, 0x74, 0x65, 0x73, 0x74]);
const result = toArray(bytes);
// result.value: [1, "test"]
// result.length: 10
```

## Relationship to Serialization

This function is the exact inverse of `serialize.fromArray()`:
```javascript
const original = [1, "test", 42n];
const serialized = fromArray(original);
const deserialized = toArray(serialized.value);
// deserialized.value === original (deep equality)
```
