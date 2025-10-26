## @scintilla-network/sdk

The `@scintilla-network/sdk` provides a comprehensive suite of TypeScript primitives and utilities designed for building and interacting with the Scintilla blockchain. This SDK simplifies the development process by offering well-defined structures for assets, governance, transactions, and more, alongside essential utilities for hashing and variable-length integer handling.

[![npm version](https://badge.fury.io/js/@scintilla-network%2Fsdk.svg)](https://www.npmjs.com/package/@scintilla-network/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


### Installation

To install the SDK in your project, run:

```bash
npm install @scintilla-network/sdk
```

#### Primitives

The SDK includes a variety of primitives, each tailored for specific use cases within the Scintilla ecosystem:

- [Asset](./src/primitives/Asset/Asset.md) - An asset is a specific asset in the Scintilla network.
- [Authorization](./src/primitives/Authorization/Authorization.md) - An authorization is a message that is used to authorize a specific action.
- [BigDecimal](./src/primitives/BigDecimal/BigDecimal.md) - A big decimal is a decimal number that is used to represent a large number.

<!-- - [DAO](./src/primitives/dao/DAO.md) - A DAO is a decentralized autonomous organization. -->
- [ClusterBlock](./src/primitives/ClusterBlock/ClusterBlock.md) - A cluster block is a block representation in a specific cluster.
- [DriveData](./src/primitives/DriveData/DriveData.md) - A drive data is a data that is stored in drive.

- [GovernanceProposal](./src/primitives/GovernanceProposal/GovernanceProposal.md) - A governance proposal is a proposal to the DAO.
- [GovernanceVote](./src/primitives/GovernanceVote/GovernanceVote.md) - A governance vote is a vote on a governance proposal.

- [HashProof](./src/primitives/HashProof/HashProof.md) - A hash proof is a POW block in a cluster
- [Identity](./src/primitives/Identity/Identity.md) - An identity is a unique entity with a moniker, address, and associated records.
- [Instruction](./src/primitives/Instruction/Instruction.md) - An instruction is a message that is used to perform a specific action.

- [Messages](./src/primitives/messages/Messages.md) - Messages are the fundamental units of communication in the Scintilla network.

- [QuorumDecision](./src/primitives/QuorumDecision/QuorumDecision.md) - A quorum decision is a decision made by a quorum.
- [QuorumDecisionVote](./src/primitives/QuorumDecisionVote/QuorumDecisionVote.md) - A quorum decision vote is a vote on a quorum decision.

- [RelayBlock](./src/primitives/RelayBlock/RelayBlock.md) - A relay block is a specific block that happen between relayers.
- [Transaction](./src/primitives/Transaction/Transaction.md) - A transaction is a message that is used to perform a specific action.
- [Transfer](./src/primitives/Transfer/Transfer.md) - A transfer is a message that is used to transfer assets.
- [Voucher](./src/primitives/Voucher/Voucher.md) - A digital voucher for transferring assets.
- [Transition](./src/primitives/Transition/Transition.md) - A transition is a message that is used to transition the state of the system.

#### Misc Primitives

- [Peer](./src/primitives/Peer/Peer.md) - A peer is a part of the network.

#### Message 
The SDK also includes primitives for message handling:

- [NetMessage](src/primitives/messages/NetMessage/NetMessage.md)
- [BlockMessage](./src/primitives/messages/BlockMessage.md)
- [PeerInfoMessage](./src/primitives/messages/PeerInfoMessage.md)
- [StatementMessage](./src/primitives/messages/StatementMessage.md)

#### Utilities
For technical operations, the SDK provides utility functions and data structures:
- [Hash (sha256)](./src/utilities/hash/README.md)
- [VarInt Encoding/Decoding](./src/utilities/varInt/README.md)
- [serialize](./src/utils/serialize/index.md)
    - [fromString](./src/utils/serialize/fromString.md) - Serialize a string to a byte array.
    - [fromVarInt](./src/utils/serialize/fromVarInt.md) - Serialize a number to a byte array.
    - [fromVarBigInt](./src/utils/serialize/fromVarBigInt.md) - Serialize a big integer to a byte array.
    - [fromObject](./src/utils/serialize/fromObject.md) - Serialize an object to a byte array.
    - [fromArray](./src/utils/serialize/fromArray.md) - Serialize an array to a byte array.
- [deserialize](./src/utils/deserialize/index.md)
    - [toVarInt](./src/utils/deserialize/toVarInt.md) - Deserialize a byte array to a number.
    - [toVarBigInt](./src/utils/deserialize/toVarBigInt.md) - Deserialize a byte array to a big integer.    
    - [toObject](./src/utils/deserialize/toObject.md) - Deserialize a byte array to an object.
    - [toArray](./src/utils/deserialize/toArray.md) - Deserialize a byte array to an array.
    - [toString](./src/utils/deserialize/toString.md) - Deserialize a byte array to a string.
- [kindToConstructor](./src/utils/kindToConstructor.md)

#### Data Structures
Some technical utilities are designed for specific data handling and management scenarios:
- [FIFOLookupMap](./src/utilities/fifoLookupMap/README.md)
- [Queue](./src/utilities/queue/README.md)
- [TimeQueue](./src/utilities/timeQueue/README.md)
- [TimeLock](./src/utilities/timeLock/README.md)

#### Trees

MerkleTree and PatriciaTree are exported from @scintilla-network/trees for convenience.

```js
import { Trees } from '@scintilla-network/sdk';
const merkleTree = new Trees.MerkleTree();
const patriciaTree = new Trees.PatriciaTree();
console.log(Trees.HASH_ALGORITHMS);
```

Merkle Tree are used to generate merkle root and proofs for a given data (i.e: HashProof, ClusterBlock, RelayBlock, etc.).  

## Network kind

Each packet starts with a kind:

```bash
    UNKNOWN = 0,
    PEER_INFO = 1,
    REQUEST = 2,
    RESPONSE = 3,
    ACKHANDSHAKE = 4,
    EPOCHBLOCK = 5,
    CLUSTERBLOCK = 6,
    HASHPROOF = 7,
    TRANSACTION = 8,
    TRANSITION = 9,
    TRANSFER = 10,
    STATEMENT = 11,
    HANDSHAKE = 12,
    QUORUMDECISION = 13,
    QUORUMDECISIONVOTE = 14,
    RELAYBLOCK = 15,
    VOUCHER = 16,
    ASSET = 17,
    IDENTITY = 18,
    GOVERNANCEPROPOSAL = 19,
    GOVERNANCEVOTE = 20,
    INSTRUCTION = 21,
    RAW = 22,
    PACKEDOBJECT = 23,
    PACKEDARRAY = 24,
```

These data structures are exported separately to emphasize their utility nature and potential broader applicability outside the direct blockchain interaction scenarios.

### Usage

To use a primitive or utility from the SDK, import it into your TypeScript file as follows:

```typescript
import { Asset, Transfer, sha256 } from '@scintilla-network/sdk';

// Example usage
const asset = new Asset({/* initial properties */});
const transfer = new Transfer({/* initial properties */});
const hash = sha256('your data here');
```

Refer to the individual documentation for each primitive and utility for detailed usage instructions.


#### Browser 

```js
<script type="module">
    import {Asset} from "@scintilla-network/sdk";
    console.log(new Asset('test'));
</script>
```

## Related Packages

- [@scintilla-network/hashes](https://www.npmjs.com/package/@scintilla-network/hashes)
- [@scintilla-network/keys](https://www.npmjs.com/package/@scintilla-network/keys)
- [@scintilla-network/trees](https://www.npmjs.com/package/@scintilla-network/trees)


### Contributing

We welcome contributions to the `@scintilla-network/sdk`! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

### License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
