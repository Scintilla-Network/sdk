# BigDecimal

Arbitrary-precision decimal arithmetic for JavaScript. Handles very large numbers and precise decimal calculations without floating-point errors.

## Installation

```js
import { BigDecimal } from '@scintilla-network/sdk';
```

## Initializing a BigDecimal    

```js
const bigDecimal = new BigDecimal('1234567890.1234567890');
```

## Usage

```js
// Initialize from string, number, or another BigDecimal
const a = new BigDecimal('123.456');
const b = new BigDecimal('789.012');

// Arithmetic operations
const sum = a.add(b);              // 912.468
const diff = a.subtract(b);        // -665.556
const product = a.multiply(b);    // 97408.265472
const quotient = a.divide(b, 10); // 0.1564862805 (10 decimal places)

new BigDecimal('10').divide(new BigDecimal('2')); // "5"
new BigDecimal('1').divide(new BigDecimal('3'));  // "0.33333..." (20 decimals default)
new BigDecimal('1').divide(new BigDecimal('3'), 2); // "0.33" (2 decimal places)
```

## API

### Constructor
- `new BigDecimal(value)` - Create from string, number, or BigDecimal

### Methods
- `add(other)` - Addition
- `subtract(other)` - Subtraction  
- `multiply(other)` - Multiplication
- `divide(other, precision?)` - Division (default precision: 20)
- `compareTo(other)` - Returns -1, 0, or 1
- `equals(other)` - Equality check
- `toString()` - String representation
- `toNumber()` - Convert to JavaScript number (throws on precision loss)