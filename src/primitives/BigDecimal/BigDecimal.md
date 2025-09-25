# BigDecimal

A big decimal is a decimal number that is used to represent a large number.

## Installation

```js
import { BigDecimal } from '@scintilla-network/sdk';
```

## Initializing a BigDecimal    

```js
const bigDecimal = new BigDecimal('1234567890.1234567890');
```

## Properties

- `value`: The value of the big decimal.

## Methods

- `add(other)`: Adds another big decimal to this big decimal.
- `subtract(other)`: Subtracts another big decimal from this big decimal.
- `multiply(other)`: Multiplies this big decimal by another big decimal.
- `divide(other)`: Divides this big decimal by another big decimal.
- `toString()`: Converts the big decimal to a string.
- `toNumber()`: Converts the big decimal to a number.
- `toJSON()`: Converts the big decimal to a JSON object.
- `toHash()`: Converts the big decimal to a hash.
- `toBase64()`: Converts the big decimal to a base64 string.    

## Example

```js
const bigDecimal = new BigDecimal('1234567890.1234567890');
console.log(bigDecimal.toString());
```