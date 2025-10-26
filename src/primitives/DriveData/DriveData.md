# DriveData

The DriveData class represents a data container with type validation and efficient binary serialization for the Scintilla Network protocol.

## Installation

```js
import { DriveData } from '@scintilla-network/sdk';
```

## Features

- **Type Validation**: Enforces valid data types with support for custom types
- **Binary Serialization**: Efficient conversion to/from binary format using the serialize library
- **Error Handling**: Graceful handling of malformed data during deserialization
- **Hash Generation**: SHA-256 hashing of serialized data

## Valid Types

DriveData supports the following standard types:
- `text` - Plain text content
- `json` - JSON formatted data
- `binary` - Binary data
- `document` - Document files
- `image` - Image files
- `video` - Video files

### Custom Types

You can also use custom types with the `other:` prefix:
```js
const pdfData = new DriveData({ type: 'other:pdf', content: '%PDF-1.4...' });
const xmlData = new DriveData({ type: 'other:xml', content: '<xml>...</xml>' });
```

## Basic Usage

### Creating DriveData Instances

```js
// Default (text type, empty content)
const data1 = new DriveData();

// With specific type and content
const data2 = new DriveData({
    type: 'json',
    content: '{"key": "value"}'
});

// With custom type
const data3 = new DriveData({
    type: 'other:pdf',
    content: 'PDF binary content...'
});
```

### Type Validation

```js
// Check if a type is valid
console.log(DriveData.isValidType('json'));    // true
console.log(DriveData.isValidType('other:pdf')); // true
console.log(DriveData.isValidType('invalid'));  // false

// Get list of all valid standard types
console.log(DriveData.getValidTypes());
// Output: ['text', 'json', 'binary', 'document', 'image', 'video']
```

### Serialization and Deserialization

```js
const data = new DriveData({
    type: 'json',
    content: '{"name": "Alice", "age": 30}'
});

// Convert to binary format
const binary = data.toUint8Array();

// Convert to hexadecimal string
const hex = data.toHex();

// Generate hash
const hash = data.toHash('hex');

// Deserialize from binary
const restored = DriveData.fromUint8Array(binary);

// Deserialize from hex string
const restored2 = DriveData.fromHex(hex);

// Roundtrip works perfectly
console.log(restored.toJSON());  // { type: 'json', content: '{"name": "Alice", "age": 30}' }
```

### Error Handling

DriveData gracefully handles malformed input during deserialization:

```js
// Malformed data returns default instance instead of throwing
const malformed = DriveData.fromUint8Array(new Uint8Array([255]));
console.log(malformed.toJSON()); // { type: 'text', content: '' }

// Invalid types throw errors during construction
try {
    new DriveData({ type: 'invalid-type', content: 'test' });
} catch (error) {
    console.log(error.message);
    // Output: Invalid type: "invalid-type". Valid types are: text, json, binary, document, image, video, or "other:customtype" format.
}
```

## API Reference

### Constructor

```typescript
constructor(options?: {
    type?: string;
    content?: string;
})
```

**Parameters:**
- `options.type` (optional): The data type. Must be a valid type
- `options.content` (optional): The data content as a string

### Static Methods

#### `DriveData.getValidTypes(): string[]`
Returns an array of all valid standard types.

#### `DriveData.isValidType(type: string): boolean`
Validates if a given type string is acceptable.

#### `DriveData.fromJSON(json: object): DriveData`
Creates a DriveData instance from a JSON object.

#### `DriveData.fromHex(hex: string): DriveData`
Deserializes a DriveData instance from a hexadecimal string.

#### `DriveData.fromUint8Array(uint8Array: Uint8Array): DriveData`
Deserializes a DriveData instance from binary data.

### Instance Methods

#### `toJSON(): { type: string; content: string }`
Converts the DriveData to a JSON object.

#### `toUint8Array(): Uint8Array`
Serializes the DriveData to binary format.

#### `toHex(): string`
Converts the DriveData to a hexadecimal string representation.

#### `toHash(encoding?: 'uint8array' | 'hex'): string | Uint8Array`
Generates a SHA-256 hash of the serialized data.

#### `toString(): string`
Returns the hexadecimal string representation (alias for toHex).

## Properties

- `type: string` - The data type (validated)
- `content: string` - The data content

## Protocol Specification

The binary format consists of:
1. **Type field**: Variable-length encoded string (length prefix + UTF-8 bytes)
2. **Content field**: Variable-length encoded string (length prefix + UTF-8 bytes)

Example binary structure:
```
[type_length][type_bytes][content_length][content_bytes]
```

Where:
- `type_length` and `content_length` are variable-length integers
- `type_bytes` and `content_bytes` are UTF-8 encoded strings

## Error Handling

DriveData implements strict error handling for various edge cases:

- **Malformed binary data**: Throws descriptive error messages
- **Invalid type during deserialization**: Throws descriptive error messages
- **Empty or insufficient data**: Throws descriptive error messages
- **Invalid types during construction**: Throws descriptive error messages


## Examples

### Working with Different Data Types

```js
// Text document
const textDoc = new DriveData({
    type: 'text',
    content: 'This is a plain text document.'
});

// JSON configuration
const config = new DriveData({
    type: 'json',
    content: JSON.stringify({ host: 'localhost', port: 8080 })
});

// Custom format (PDF)
const pdfDoc = new DriveData({
    type: 'other:pdf',
    content: pdfBinaryContent
});

// Binary data
const binaryData = new DriveData({
    type: 'binary',
    content: binaryStringContent
});
```

### Validation and Type Checking

```js
// Validate before creation
const userType = 'other:pdf';
if (DriveData.isValidType(userType)) {
    const data = new DriveData({ type: userType, content: 'PDF content' });
}

// Check against standard types
if (DriveData.getValidTypes().includes('json')) {
    const jsonData = new DriveData({ type: 'json', content: 'JSON data' });
}
```

### Error Handling

DriveData implements strict error handling - invalid data will throw errors instead of falling back to defaults:

```js
// Invalid types throw errors during construction
try {
    new DriveData({ type: 'invalid-type', content: 'test' });
} catch (error) {
    console.log(error.message);
    // Output: Invalid type: "invalid-type". Valid types are: text, json, binary, document, image, video, or "other:customtype" format.
}

// Malformed binary data throws errors during deserialization
try {
    DriveData.fromUint8Array(malformedBuffer);
} catch (error) {
    console.log('Deserialization failed:', error.message);
}

// Empty types are no longer supported and will throw errors
try {
    new DriveData({ type: '', content: 'test' });
} catch (error) {
    console.log('Empty types are rejected:', error.message);
}
```

## Best Practices

1. **Always validate types** before creating instances for user-provided data
2. **Use standard types** when possible for better interoperability
3. **Handle deserialization errors** - always wrap deserialization in try-catch blocks
4. **Use custom types** with the `other:` prefix for application-specific formats
5. **Verify roundtrip serialization** when implementing new features
6. **Avoid empty types** - they are no longer supported and will throw errors

## License

MIT License - see the [LICENSE](../../../LICENSE) file for details.
