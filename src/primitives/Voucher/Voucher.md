## Voucher Class Documentation

### Overview
The Voucher class represents a digital voucher in the Scintilla network, providing functionality for creating, managing, and validating transferable value tokens. Each voucher contains information about assets, inputs, outputs, and authorization details.

### Installation
```js
import { Voucher } from '@scintilla/ts-sdk';
```

### Initializing a Voucher

You can initialize a Voucher instance by providing an object with properties that match the IVoucherOptions interface:

```typescript
const voucher = new Voucher({
    version: 1,
    asset: 'test-asset',
    inputs: [{ 
        amount: 100n, hash: '3284d6c6228b931f0cb36146a79bd85d5e4bf02d9c3b8219a31285b80305625c',
        }
    ],
    output: { amount: 100n, recipient: 'test-recipient' },
    stack: [],
    data: [{description:'test-data-1-description-very-long-description-sufficient-for-v1-limit', type:'RAW'}],
    timelock: {
        startAt: 10n,
        endAt: 20n,
        createdAt: Date.now()
    },
    authorizations: [{
        signature: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        publicKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        moniker: 'test-moniker',
        address: 'test-address'
    }]
});
```

#### Properties
- `hash`: Unique identifier of the voucher (auto-computed if not provided)
- `asset`: The asset identifier this voucher represents
- `inputs`: Array of input sources (previous vouchers)
- `output`: Destination and amount information
- `stack`: Optional array for custom execution stack
- `data`: Optional array for additional data
- `timelock`: Timing constraints for voucher validity
- `authorizations`: Array of signatures and authorization details

#### Methods

##### `computeHash()`
Computes the unique hash identifier for the voucher:
```typescript
const hash = voucher.computeHash();
```

##### `sign(signer)`
Signs the voucher with the provided signer:
```typescript
await voucher.sign(signer);
```

##### `verifySignature(signer?)`
Verifies the voucher's signatures:
```typescript
const isValid = voucher.verifySignature();
```

##### `isValidAtTime(currentTick)`
Checks if the voucher is valid at a specific time:
```typescript
const isValid = voucher.isValidAtTime(BigInt(Date.now()));
```

##### `getTotalInput()`
Calculates the total input amount:
```typescript
const total = voucher.getTotalInput(); // returns BigInt
```

##### `getTotalOutput()`
Calculates the total output amount:
```typescript
const total = voucher.getTotalOutput(); // returns BigInt
```

#### Example Usage

```typescript
import { Voucher } from '@scintilla/ts-sdk';

// Create a new voucher
const voucher = new Voucher({
    asset: 'sct',
    inputs: [
        { amount: 500n, hash: 'previous-voucher-hash' }
    ],
    output: {
        amount: 500n,
        recipient: 'recipient-address'
    },
    timelock: {
        startAt: BigInt(Date.now()),
        endAt: BigInt(Date.now() + 3600000), // Valid for 1 hour
        createdAt: BigInt(Date.now())
    }
});

// Sign the voucher
await voucher.sign(signer);

// Verify the voucher
if (voucher.isValid() && voucher.isValidAtTime(BigInt(Date.now()))) {
    console.log('Voucher is valid and within timelock constraints');
}

// Get voucher details
console.log(`Total Input: ${voucher.getTotalInput()}`);
console.log(`Total Output: ${voucher.getTotalOutput()}`);
console.log(`Asset: ${voucher.asset}`);
```

### Security Considerations
- Always verify signatures before accepting a voucher
- Check timelock constraints when processing vouchers
- Ensure input and output amounts match
- Validate all authorizations are present and valid