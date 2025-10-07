# SIP-000: Serialization and Deserialization Format

```
Status: Active
Type: Standards Track
Created: 2025-10-05
Updated: 2025-10-05
Category: Overview
```

## Abstract

This document provides a comprehensive overview of the Scintilla Network binary serialization format. It defines the encoding patterns for primitive types and composite structures, ensuring deterministic, compact, and type-safe data exchange across the protocol.

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Type System](#2-type-system)
3. [Primitive Patterns](#3-primitive-patterns)
4. [Composite Structures](#4-composite-structures)
5. [Complete Examples](#5-complete-examples)
6. [Determinism](#6-determinism)

---

## 1. Philosophy

### 1.1 Core Principles

```
Deterministic
├─ Same input → Same output (byte-for-byte)
├─ Alphabetically sorted object fields
└─ Canonical encoding (minimal representation)

Compact
├─ Variable-length encoding (VarInt/VarBigInt)
├─ No padding or alignment
└─ Length-prefixed data

Type-Safe
├─ Explicit type markers (0x50-0x55)
├─ No ambiguous representations
└─ Nested structures preserve types

Cross-Platform
├─ Language-agnostic binary format
├─ Endianness-neutral encoding
└─ Protocol Buffers compatible (VarInt)
```

### 1.2 Design Rationale

**Why variable-length encoding?**
- Small integers (0-127) use only 1 byte
- Most real-world data uses small numbers
- Saves ~75% space for typical values

**Why explicit type bytes?**
- Enables dynamic deserialization
- Prevents type confusion attacks
- Self-describing format

**Why alphabetical sorting?**
- Guarantees deterministic output
- Same object always produces identical bytes
- Critical for cryptographic signatures

---

## 2. Type System

### 2.1 Type Byte Registry

```
Primitive Type Bytes (in field values):
┌──────────┬──────┬──────┬─────────────────────────┐
│ Type     │ Hex  │ Dec  │ Usage                   │
├──────────┼──────┼──────┼─────────────────────────┤
│ String   │ 0x50 │  80  │ UTF-8 strings           │
│ VarInt   │ 0x51 │  81  │ Integers 0 to 2^53-1    │
│ BigInt   │ 0x52 │  82  │ Large integers > 2^53   │
│ Array    │ 0x53 │  83  │ Nested arrays           │
│ Object   │ 0x54 │  84  │ Nested objects          │
│ Boolean  │ 0x55 │  85  │ true/false              │
└──────────┴──────┴──────┴─────────────────────────┘

Kind Bytes (top-level structures):
┌──────────┬──────┬──────┬─────────────────────────┐
│ Structure│ Hex  │ Dec  │ Constant                │
├──────────┼──────┼──────┼─────────────────────────┤
│ Object   │ 0x17 │  23  │ NET_KINDS.PACKEDOBJECT  │
│ Array    │ 0x18 │  24  │ NET_KINDS.PACKEDARRAY   │
└──────────┴──────┴──────┴─────────────────────────┘
```

### 2.2 Type Detection

```javascript
// JavaScript type mapping
typeof value === 'string'   → 0x50
typeof value === 'number'   → 0x51 (if safe integer)
typeof value === 'bigint'   → 0x52
typeof value === 'boolean'  → 0x55
Array.isArray(value)        → 0x53
typeof value === 'object'   → 0x54
value.kind !== undefined    → Use kind byte (primitives with .toUint8Array())
```

---

## 3. Primitive Patterns

Each primitive follows a consistent pattern that is reused throughout the protocol.

### 3.1 Boolean Pattern

```
┌─────────┐
│  VALUE  │  Single byte: 0x00 (false) or 0x01 (true)
└─────────┘
  1 byte
```

**Examples:**
```
false → 00
true  → 01
```

**In Context (with type byte):**
```
In objects/arrays: [0x55][VALUE]
Example: true → 55 01
```

---

### 3.2 VarInt Pattern

```
┌──────────────────────────┐
│   VARINT_BYTES (1-8)     │  7 bits per byte + continuation bit
└──────────────────────────┘
  variable bytes
```

**Byte Structure:**
```
┌─┬───────┐
│C│ 7 bits│  C = Continuation (1=more, 0=last)
└─┴───────┘
```

**Examples:**
```
0       → 00
42      → 2A
128     → 80 01
1000    → E8 07
16384   → 80 80 01
```

**Encoding:** Little-endian, 7 bits per byte, continuation bit in MSB.

**In Context (with type byte):**
```
In objects/arrays: [0x51][VARINT_BYTES]
Example: 42 → 51 2A
```

---

### 3.3 VarBigInt Pattern

```
┌──────────────────────────┐
│  VARBIGINT_BYTES (1-N)   │  Same as VarInt, unlimited size
└──────────────────────────┘
  variable bytes
```

**Identical encoding to VarInt** but supports arbitrarily large integers.

**Examples:**
```
0n              → 00
1000n           → E8 07
2^53            → 80 80 80 80 80 80 80 80 01  (9 bytes)
2^64-1          → FF FF FF FF FF FF FF FF FF 01  (10 bytes)
```

**In Context (with type byte):**
```
In objects/arrays: [0x52][VARBIGINT_BYTES]
Example: 1000n → 52 E8 07
```

---

### 3.4 String Pattern

```
┌─────────────────┬──────────────────────┐
│ LENGTH (varint) │ UTF8_BYTES (n bytes) │
└─────────────────┴──────────────────────┘
  var bytes         n bytes
```

**This pattern is universal** - used standalone and in objects/arrays.

**Examples:**
```
""          → 00
"A"         → 01 41
"hello"     → 05 68 65 6C 6C 6F
"世界"       → 06 E4 B8 96 E7 95 8C  (UTF-8: 3 bytes per character)
"👋"         → 04 F0 9F 91 8B  (UTF-8: 4 bytes for emoji)
```

**Key Points:**
- LENGTH = UTF-8 byte count (not character count)
- No null terminator
- Standard UTF-8 encoding (RFC 3629)

**In Context (with type byte):**
```
In objects/arrays: [0x50][LENGTH][UTF8_BYTES]
Example: "hi" → 50 02 68 69
```

---

## 4. Composite Structures

### 4.1 Object Structure

```
Complete Layout:
┌──────────────────────────────────────────────────────────────┐
│ KIND (0x17)                                                  │
├──────────────────────────────────────────────────────────────┤
│ OBJECT_TOTAL_LENGTH (varint)                                │
│   └─ Sum of: names_section + values_section (with lengths)  │
├──────────────────────────────────────────────────────────────┤
│ FIELD_NAMES_LENGTH (varint)                                 │
├──────────────────────────────────────────────────────────────┤
│ FIELD_VALUES_LENGTH (varint)                                │
├──────────────────────────────────────────────────────────────┤
│ FIELD_NAMES_SECTION                                          │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ COUNT (varint)                                         │  │
│ │ For each field (alphabetically):                       │  │
│ │   [LENGTH (varint)][UTF8_BYTES]  ← String pattern     │  │
│ └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│ FIELD_VALUES_SECTION                                         │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ COUNT (varint) - must match names count                │  │
│ │ For each value (same order as names):                  │  │
│ │   [TYPE_BYTE][VALUE_DATA]  ← Primitive patterns       │  │
│ └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Field Value Encoding:**
```
String value:  [0x50][LENGTH][UTF8_BYTES]  ← Uses string pattern
VarInt value:  [0x51][VARINT_BYTES]        ← Uses varint pattern
BigInt value:  [0x52][VARBIGINT_BYTES]     ← Uses varbigint pattern
Boolean value: [0x55][BOOL_BYTE]           ← Uses boolean pattern
Array value:   [0x53][LENGTH][ARRAY_BYTES] ← Nested, length-prefixed
Object value:  [0x54][LENGTH][OBJ_BYTES]   ← Nested, length-prefixed
```

**Example:** `{ count: 42, name: "Alice" }`
```
17              KIND = PACKEDOBJECT
21              OBJECT_TOTAL_LENGTH = 33
1A              FIELD_NAMES_LENGTH = 26
07              FIELD_VALUES_LENGTH = 7

--- Names (26 bytes) ---
02              COUNT = 2
05 63 6F 75 6E 74    "count" (5 bytes)
04 6E 61 6D 65       "name" (4 bytes)

--- Values (7 bytes) ---
02              COUNT = 2
51 2A           count: VarInt 42
50 05 41 6C 69 63 65  name: String "Alice"
```

---

### 4.2 Array Structure

```
Complete Layout:
┌──────────────────────────────────────────────────────────────┐
│ KIND (0x18)                                                  │
├──────────────────────────────────────────────────────────────┤
│ ITEM_COUNT (varint)                                          │
├──────────────────────────────────────────────────────────────┤
│ ITEMS_BYTES_LENGTH (varint)                                  │
├──────────────────────────────────────────────────────────────┤
│ ITEMS_SECTION                                                │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ For each item (index order):                           │  │
│ │   [TYPE_BYTE][VALUE_DATA]  ← Primitive patterns       │  │
│ └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Item Encoding** (same as object field values):
```
String:  [0x50][LENGTH][UTF8_BYTES]
VarInt:  [0x51][VARINT_BYTES]
BigInt:  [0x52][VARBIGINT_BYTES]
Boolean: [0x55][BOOL_BYTE]
Array:   [0x53][LENGTH][ARRAY_BYTES]  ← Recursive
Object:  [0x54][LENGTH][OBJ_BYTES]    ← Recursive
```

**Example:** `[1, "hello", true]`
```
18              KIND = PACKEDARRAY
03              ITEM_COUNT = 3
0B              ITEMS_BYTES_LENGTH = 11

--- Items (11 bytes) ---
51 01           Item 0: VarInt 1
50 05 68 65 6C 6C 6F  Item 1: String "hello"
55 01           Item 2: Boolean true
```

---

### 4.3 Pattern Reusability

**Key Insight:** Primitives use the same encoding everywhere.

```
String Pattern: [LENGTH][UTF8_BYTES]
├─ Standalone: [LENGTH][UTF8_BYTES]
├─ In Object:  [0x50][LENGTH][UTF8_BYTES]
└─ In Array:   [0x50][LENGTH][UTF8_BYTES]

VarInt Pattern: [VARINT_BYTES]
├─ Standalone: [VARINT_BYTES]
├─ In Object:  [0x51][VARINT_BYTES]
└─ In Array:   [0x51][VARINT_BYTES]

Boolean Pattern: [VALUE]
├─ Standalone: [VALUE]
├─ In Object:  [0x55][VALUE]
└─ In Array:   [0x55][VALUE]
```

**This consistency enables:**
- Code reuse (serialize/deserialize functions)
- Predictable byte layouts
- Easy manual parsing/debugging

---

## 5. Complete Examples

### 5.1 All Primitive Types

**Input:**
```javascript
{
  str: "test",
  num: 42,
  big: 1000n,
  bool: true
}
```

**Output (annotated hex):**
```
17                      KIND = PACKEDOBJECT
26                      OBJECT_TOTAL_LENGTH = 38
17                      FIELD_NAMES_LENGTH = 23
0F                      FIELD_VALUES_LENGTH = 15

--- Names (23 bytes, alphabetically) ---
04                      COUNT = 4
03 62 69 67             "big"
04 62 6F 6F 6C          "bool"
03 6E 75 6D             "num"
03 73 74 72             "str"

--- Values (15 bytes, same order) ---
04                      COUNT = 4
52 E8 07                big: BigInt 1000n
55 01                   bool: Boolean true
51 2A                   num: VarInt 42
50 04 74 65 73 74       str: String "test"
```

**Total: 39 bytes**

---

### 5.2 Nested Structure

**Input:**
```javascript
{
  user: { id: 1, active: true },
  count: 5
}
```

**Output (hierarchical view):**
```
17                      Outer KIND = PACKEDOBJECT
...                     Outer lengths

--- Outer Names ---
02                      COUNT = 2
05 63 6F 75 6E 74       "count"
04 75 73 65 72          "user"

--- Outer Values ---
02                      COUNT = 2

51 05                   count: VarInt 5

54                      user: TYPE = Object
  1A                    Nested object LENGTH = 26 bytes
  
  17                    Nested KIND = PACKEDOBJECT
  18                    Nested OBJECT_TOTAL_LENGTH
  0D                    Nested FIELD_NAMES_LENGTH
  0B                    Nested FIELD_VALUES_LENGTH
  
  --- Nested Names ---
  02                    COUNT = 2
  06 61 63 74 69 76 65  "active"
  02 69 64              "id"
  
  --- Nested Values ---
  02                    COUNT = 2
  55 01                 active: Boolean true
  51 01                 id: VarInt 1
```

---

### 5.3 Empty Structures

**Empty Object:**
```
Input:  {}
Output: 17 06 02 02 00 00

Breakdown:
  17    KIND = PACKEDOBJECT
  06    OBJECT_TOTAL_LENGTH = 6
  02    FIELD_NAMES_LENGTH = 2
  02    FIELD_VALUES_LENGTH = 2
  00    Names COUNT = 0
  00    Values COUNT = 0
```

**Empty Array:**
```
Input:  []
Output: 18 00 00

Breakdown:
  18    KIND = PACKEDARRAY
  00    ITEM_COUNT = 0
  00    ITEMS_BYTES_LENGTH = 0
```

---

## 6. Determinism

### 6.1 Canonical Representation Rules

```
Object Fields:
├─ MUST be sorted alphabetically (UTF-8 byte order)
├─ Example: ['zebra', 'apple'] → ['apple', 'zebra']
└─ Ensures same object always produces same bytes

VarInt/VarBigInt:
├─ MUST use minimal byte representation
├─ No overlong encoding (e.g., 1 as 80 01 is invalid)
└─ Value 42 MUST be 2A, not 80 80...2A

Strings:
├─ MUST use standard UTF-8 encoding
├─ No normalization variations
└─ Byte count, not character count
```

### 6.2 Determinism Guarantees

Given identical inputs, serialization **MUST** produce:
```
✓ Byte-for-byte identical output
✓ Same output regardless of property insertion order
✓ Same output across JavaScript engines
✓ Same output across platforms
✓ Suitable for cryptographic signing
```

---

## 7. Byte Length Formulas

### 7.1 Primitive Lengths

```
Boolean:
  Total = 2 bytes (1 type + 1 value)
  Example: true → 55 01

VarInt:
  Total = 1 + varint_bytes(value)
  Example: 42 → 51 2A (2 bytes)

VarBigInt:
  Total = 1 + varbigint_bytes(value)
  Example: 1000n → 52 E8 07 (3 bytes)

String:
  Total = 1 + varint_bytes(utf8_len) + utf8_len
  Example: "hi" → 50 02 68 69 (4 bytes)
```

### 7.2 VarInt Byte Count Table

```
┌─────────────────────┬──────────────┐
│ Value Range         │ VarInt Bytes │
├─────────────────────┼──────────────┤
│ 0 - 127             │ 1            │
│ 128 - 16,383        │ 2            │
│ 16,384 - 2,097,151  │ 3            │
│ 2M - 268M           │ 4            │
│ 268M - 34B          │ 5            │
│ 34B - 4T            │ 6            │
│ 4T - 562T           │ 7            │
│ 562T - 2^53-1       │ 8            │
└─────────────────────┴──────────────┘
```

### 7.3 Composite Structure Lengths

**Object:**
```
Total = 1 (KIND)
      + varint_bytes(obj_total_len)
      + varint_bytes(names_len)
      + varint_bytes(values_len)
      + names_section_bytes
      + values_section_bytes
```

**Array:**
```
Total = 1 (KIND)
      + varint_bytes(item_count)
      + varint_bytes(items_len)
      + items_section_bytes
```

---

## 8. Visual Bit Layout

### 8.1 VarInt Encoding

```
Value: 300 (decimal) = 100101100 (binary)

Step 1: Split into 7-bit groups (LSB first)
  0101100 (44)    0000010 (2)
  
Step 2: Add continuation bits
  1_0101100       0_0000010
  └ more bytes    └ last byte
  
Step 3: Result bytes
  0xAC (10101100)  0x02 (00000010)
```

**Visual representation:**
```
Byte 0          Byte 1
┌─┬──────┐     ┌─┬──────┐
│1│101100│     │0│000010│
└─┴──────┘     └─┴──────┘
 │   └─44       │   └─2
 └─continue     └─last

Value = 44 + (2 × 128) = 300
```

### 8.2 Boolean Encoding

```
false (0x00):              true (0x01):
┌─┬─┬─┬─┬─┬─┬─┬─┐          ┌─┬─┬─┬─┬─┬─┬─┬─┐
│0│0│0│0│0│0│0│0│          │0│0│0│0│0│0│0│1│
└─┴─┴─┴─┴─┴─┴─┴─┴─┘        └─┴─┴─┴─┴─┴─┴─┴─┘
  All zeros                  LSB set
```

---

## 9. Encoding & Decoding Flow

### 9.1 Serialization Dispatch (fromObject)

```
┌─────────────────────────────────────────────────────────┐
│ fromObject(input)                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐                                     │
│  │ Detect Type    │                                     │
│  └────────┬───────┘                                     │
│           │                                              │
│     ┌─────┴─────┬──────────┬──────────┐                │
│     ▼           ▼          ▼          ▼                │
│  Has .kind?  Array?    Object?   Primitive?             │
│     │           │          │          │                │
│     ▼           ▼          ▼          ▼                │
│  .toUint8Array() serializeArray() serializeObject()     │
│     │           │          │          │                │
│     └───────────┴──────────┴──────────┘                │
│                 │                                        │
│             Return bytes                                 │
└─────────────────────────────────────────────────────────┘
```

**Type Detection Logic:**
```javascript
if (input.kind !== undefined) {
  return input.toUint8Array();  // Network primitive
}
else if (Array.isArray(input)) {
  return serializeArray(input);  // KIND 0x18
}
else if (typeof input === 'object') {
  return serializeObject(input); // KIND 0x17
}
```

### 9.2 Deserialization Dispatch (toObject)

```
┌─────────────────────────────────────────────────────────┐
│ toObject(bytes)                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐                                     │
│  │ Read KIND Byte │                                     │
│  └────────┬───────┘                                     │
│           │                                              │
│     ┌─────┴─────┬──────────┬──────────┐                │
│     ▼           ▼          ▼          ▼                │
│  0x17?       0x18?     NET_KINDS?  Unknown?             │
│     │           │          │          │                │
│     ▼           ▼          ▼          ▼                │
│ deserializeObject() deserializeArray() Constructor  Error│
│     │           │          │                            │
│     └───────────┴──────────┘                            │
│                 │                                        │
│         Return { value, length }                         │
└─────────────────────────────────────────────────────────┘
```

**KIND Byte Logic:**
```javascript
const kind = bytes[0];

if (kind === 0x17) {
  return deserializeObject(bytes);
}
else if (kind === 0x18) {
  return deserializeArray(bytes);
}
else if (kind in NET_KINDS_MAP) {
  const Constructor = kindToConstructor(kind);
  return Constructor.fromUint8Array(bytes);
}
else {
  throw new Error(`Unknown kind: ${kind}`);
}
```

### 9.3 Object Serialization Flow

```
┌─────────────────────────────────────────────────────────┐
│ serializeObject(obj)                                     │
├─────────────────────────────────────────────────────────┤
│ 1. Extract field names → sort alphabetically            │
│ 2. For each field:                                       │
│    ├─ Determine type (string/number/bigint/bool/etc)    │
│    └─ Store type mapping                                │
│ 3. Serialize field names:                               │
│    ├─ FIELD_COUNT (varint)                              │
│    └─ For each: LENGTH + UTF8_BYTES                     │
│ 4. Serialize field values:                              │
│    ├─ FIELD_COUNT (varint)                              │
│    └─ For each: TYPE_BYTE + VALUE                       │
│ 5. Calculate lengths                                     │
│ 6. Assemble: [0x17][lengths][names][values]            │
└─────────────────────────────────────────────────────────┘
```

### 9.4 Array Serialization Flow

```
┌─────────────────────────────────────────────────────────┐
│ serializeArray(arr)                                      │
├─────────────────────────────────────────────────────────┤
│ 1. Get item count                                        │
│ 2. For each item (in index order):                       │
│    ├─ Determine type                                     │
│    ├─ Serialize: TYPE_BYTE + VALUE                       │
│    └─ Accumulate bytes                                   │
│ 3. Calculate total items byte length                     │
│ 4. Assemble: [0x18][count][length][items]              │
└─────────────────────────────────────────────────────────┘
```

### 9.5 Implementation Entry Points

**Universal API:**
```javascript
// Serialization (universal entry point)
fromObject(input)
├─ Handles: Objects, Arrays, Primitives with .kind
├─ Auto-detects type
└─ Returns: { value: Uint8Array, length: number }

// Deserialization (universal entry point)
toObject(bytes)
├─ Reads KIND byte to determine type
├─ Dispatches to appropriate deserializer
└─ Returns: { value: any, length: number }
```

**Primitive Functions:**
```javascript
// Direct primitive serialization (without type byte)
fromBoolean(bool)   → { value: Uint8Array, length: 1 }
fromVarInt(num)     → { value: Uint8Array, length: 1-8 }
fromVarBigInt(big)  → { value: Uint8Array, length: 1-N }
fromString(str)     → { value: Uint8Array, length: var }

// Direct primitive deserialization (without type byte)
toBoolean(bytes)    → { value: boolean, length: 1 }
toVarInt(bytes)     → { value: number, length: 1-8 }
toVarBigInt(bytes)  → { value: bigint, length: 1-N }
toString(bytes)     → { value: string, length: var }
```

**Note:** Primitive functions are used internally and for testing. Use `fromObject()` and `toObject()` for general serialization.

---

## 10. Quick Reference

### 10.1 Cheat Sheet

```
Type Bytes:
  0x50 → String      0x53 → Array      0x55 → Boolean
  0x51 → VarInt      0x54 → Object
  0x52 → BigInt

Kind Bytes:
  0x17 → Object      0x18 → Array

Common Values:
  false → 00         true → 01
  0     → 00         42   → 2A
  128   → 80 01      1000 → E8 07
  ""    → 00         "hi" → 02 68 69
```

### 10.2 Reading Bytes

```
First byte analysis:
  0x17 → It's an object
  0x18 → It's an array
  0x50-0x55 → It's a primitive type byte
  Other → It's a custom kind
  
Next action:
  Object/Array → Read structure (lengths, counts, data)
  Type byte → Read primitive value
  Custom kind → Use kindToConstructor()
```

---

## Appendix A: UTF-8 Reference

```
Code Point Range  │ Bytes │ Pattern
──────────────────┼───────┼─────────────────────────────
U+0000 - U+007F   │   1   │ 0xxxxxxx
U+0080 - U+07FF   │   2   │ 110xxxxx 10xxxxxx
U+0800 - U+FFFF   │   3   │ 1110xxxx 10xxxxxx 10xxxxxx
U+10000 - U+10FFFF│   4   │ 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx

Examples:
  'A'  (U+0041) → 1 byte:  41
  'é'  (U+00E9) → 2 bytes: C3 A9
  '世' (U+4E16) → 3 bytes: E4 B8 96
  '👋' (U+1F44B) → 4 bytes: F0 9F 91 8B
```

---

## Appendix B: Compatibility

### Protocol Buffers
- VarInt encoding: **100% compatible**
- Can decode protobuf varints
- Can encode for protobuf consumption

### Platform Support
- **JavaScript**: ES2020+ (BigInt support)
- **Cross-platform**: Language-agnostic binary format
- **Future**: Python, Rust, Go implementations planned

---

**Document Status**: Active  
**Category**: Specification Overview  
**Implementations**: JavaScript (Reference)  
**Last Updated**: 2025-10-05

---

**Note**: This document provides the complete serialization format specification. For implementation details and usage examples, refer to the individual function documentation in `src/utils/serialize/` and `src/utils/deserialize/`.
