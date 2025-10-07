# QuorumDecision

## Overview

The `QuorumDecision` class represents a decision made by the quorum, with support for signing and verifying multiple authorizations. It includes methods for converting the decision to various formats, signing the decision, and verifying signatures.

## Usage

### Example

```javascript
import QuorumDecision from '@scintilla-network/quorums/QuorumDecision';
import { sign, verify } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha2';
import { encode as base64Encode } from '@stablelib/base64';

const decision = new QuorumDecision({
    proposer: 'proposer1',
    cluster: 'cluster1',
    quorum: 'quorum1',
    payload: { data: 'test' },
    action: 'ADD_MEMBER',
});

const mockSigner = {
    async signMessageWithSecp256k1(message) {
        const hashedMessage = sha256(message);
        const signature = await sign(privateKey, hashedMessage);
        return [signature, publicKey];
    },
    getMoniker() {
        return 'proposer1';
    },
    toAddress() {
        return 'address1';
    },
};

await decision.sign(mockSigner);
console.log(decision.verifySignatures());
```

## Methods

### `constructor({ proposer, cluster, quorum, payload, action, timestamp })`

Creates a new QuorumDecision instance.

- `proposer` (string): The proposer of the decision.
- `cluster` (string): The cluster in which the quorum resides.
- `quorum` (string): The quorum identifier.
- `payload` (Object): The payload of the decision.
- `action` (string): The action of the decision.
- `timestamp` (string, optional): The timestamp of the decision.

### `toBuffer({ excludeAuthorization = false } = {})`

Converts the QuorumDecision instance to a Buffer.

- `excludeAuthorization` (boolean, optional): Whether to exclude authorizations from the buffer.

Returns: `Buffer`

### `toJSON({ excludeAuthorization = false } = {})`

Converts the QuorumDecision instance to a JSON object.

- `excludeAuthorization` (boolean, optional): Whether to exclude authorizations from the JSON.

Returns: `Object`

### `toHex({ excludeAuthorization = false } = {})`

Converts the QuorumDecision instance to a hex string.

- `excludeAuthorization` (boolean, optional): Whether to exclude authorizations from the hex string.

Returns: `string`

### `toHash(encoding = 'hex', { excludeAuthorization = false } = {})`

Computes the hash of the QuorumDecision instance.

- `encoding` (string, optional): The encoding of the hash.
- `excludeAuthorization` (boolean, optional): Whether to exclude authorizations from the hash.

Returns: `string | Uint8Array`

### `async sign(signer)`

Signs the QuorumDecision instance using the provided signer.

- `signer` (Object): The signer object, expected to have a `signMessageWithSecp256k1` method.

Throws: `Error` if signing fails.

### `verifySignatures()`

Verifies all signatures in the authorizations array.

Returns: `boolean` True if all signatures are valid, false otherwise.

Throws: `Error` if verification fails.

### `addAuthorization(authorization)`

Adds an authorization to the authorizations array.

- `authorization` (Object): The authorization object containing `signature` and `publicKey`.

Throws: `Error` if the signature is missing or invalid.
