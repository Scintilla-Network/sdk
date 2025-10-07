## Overview

The `QuorumDecisionVote` class represents a vote on a QuorumDecision. It includes methods for converting the vote to various formats, signing the vote, and verifying the signature.

## Usage

### Example

```javascript
import QuorumDecisionVote from '@scintilla-network/quorums/QuorumDecisionVote';
import { sign, verify } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha2';
import { encode as base64Encode } from '@stablelib/base64';

const vote = new QuorumDecisionVote({
    decisionHash: '123456',
    voter: 'voter1',
    vote: true,
});

const mockSigner = {
    async signMessageWithSecp256k1(message) {
        const hashedMessage = sha256(message);
        const signature = await sign(privateKey, hashedMessage);
        return [signature, publicKey];
    }
};

await vote.sign(mockSigner);
console.log(await vote.verifySignature(publicKey));
```

## Methods

### `constructor({ decisionHash, voter, vote, timestamp })`

Creates a new QuorumDecisionVote instance.

- `decisionHash` (string): The hash of the QuorumDecision being voted on.
- `voter` (string): The voter identifier.
- `vote` (boolean): The vote (true for approval, false for rejection).
- `timestamp` (string, optional): The timestamp of the vote.

### `toBuffer()`

Converts the QuorumDecisionVote instance to a Buffer.

Returns: `Buffer`

### `toJSON()`

Converts the QuorumDecisionVote instance to a JSON object.

Returns: `Object`

### `async sign(signer)`

Signs the QuorumDecisionVote instance using the provided signer.

- `signer` (Object): The signer object, expected to have a `signMessageWithSecp256k1` method.

Throws: `Error` if signing fails.

### `async verifySignature(publicKey)`

Verifies the signature of the QuorumDecisionVote instance.

- `publicKey` (Uint8Array): The public key to verify against.

Returns: `boolean` True if the signature is valid, false otherwise.

Throws: `Error` if verification fails or if no signature is found.
