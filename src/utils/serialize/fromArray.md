# fromArray Serialization Protocol

## Overview
The `fromArray` function serializes JavaScript arrays into a deterministic byte format following the Scintilla Network protocol specification.

## Protocol Structure

### Byte Layout
```
[KIND][ITEMS_COUNT][ITEM_1][ITEM_2]...[ITEM_N]
```

### Field Specifications

#### 1. KIND (1 byte)
- **Value**: `0x18` (24 decimal)
- **Constant**: `NET_KINDS.PACKEDARRAY`
- **Purpose**: Identifies this as a packed array structure

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
| Type | Byte Value | Hex | Description |
|------|------------|-----|-------------|
| String | 80 | 0x50 | UTF-8 encoded string |
| VarInt | 81 | 0x51 | Variable-length integer |
| BigInt | 82 | 0x52 | Variable-length big integer |
| Array | 83 | 0x53 | Nested array (recursive) |
| Object | 84 | 0x54 | Nested object |

### Item Serialization Rules

#### Primitive Objects (with `.kind` property)
- **Condition**: Item has a `.kind` property
- **Serialization**: Direct call to `item.toUint8Array()`
- **No type byte prefix**: The object's own serialization includes its kind

#### String Items
- **Type Byte**: `0x50`
- **Format**: `[0x50][LENGTH_VARINT][UTF8_BYTES]`
- **Example**: `"hello"` → `0x50 0x05 0x68 0x65 0x6C 0x6C 0x6F`

#### Number Items (VarInt)
- **Type Byte**: `0x51`
- **Format**: `[0x51][VARINT_BYTES]`
- **Example**: `42` → `0x51 0x2A`

#### BigInt Items
- **Type Byte**: `0x52`
- **Format**: `[0x52][VARBIGINT_BYTES]`
- **Example**: `123n` → `0x52 0x7B`

#### Array Items (Recursive)
- **Type Byte**: `0x53`
- **Format**: `[0x53][NESTED_ARRAY_BYTES]`
- **Recursion**: Calls `fromArray()` recursively

#### Object Items
- **Type Byte**: `0x54`
- **Format**: `[0x54][NESTED_OBJECT_BYTES]`
- **Recursion**: Calls `fromObject()` for serialization

## Examples

### Simple Array
```javascript
Input: [1, "hello", 42n]
Output: [0x18, 0x03, 0x51, 0x01, 0x50, 0x05, 0x68, 0x65, 0x6C, 0x6C, 0x6F, 0x52, 0x2A]
```

Breakdown:
- `0x18`: PACKEDARRAY kind
- `0x03`: 3 items
- `0x51 0x01`: VarInt type, value 1
- `0x50 0x05 0x68...0x6F`: String type, length 5, "hello"
- `0x52 0x2A`: BigInt type, value 42n

### Nested Array
```javascript
Input: [1, [2, 3]]
Output: [0x18, 0x02, 0x51, 0x01, 0x53, 0x18, 0x02, 0x51, 0x02, 0x51, 0x03]
```

Breakdown:
- `0x18`: PACKEDARRAY kind
- `0x02`: 2 items
- `0x51 0x01`: First item: VarInt 1
- `0x53`: Second item: Array type
- `0x18 0x02 0x51 0x02 0x51 0x03`: Nested array [2, 3]

## Deterministic Properties

1. **Order Preservation**: Array items maintain their original order
2. **Type Consistency**: Each item type is explicitly encoded
3. **Length Prefixing**: All variable-length data includes length information
4. **Recursive Structure**: Nested arrays/objects follow the same rules

## Error Conditions

- **Invalid Input**: Throws error if input is not an array
- **Unsupported Types**: Throws error for unsupported JavaScript types
- **Circular References**: May cause stack overflow (not handled)

## Usage
```javascript
import { fromArray } from './fromArray.js';

const result = fromArray([1, "test", 42n]);
// result.value: Uint8Array containing serialized bytes
// result.length: Total byte length
```
