## kindToConstructor

## Description

## Usage

```typescript
import { kindToConstructor } from '@scintilla-network/sdk/utils/kindToConstructor.js';
const constructor = kindToConstructor('TRANSITION');
const instance = new constructor(props)
```

## Returns

The constructor of the primitive. 

List: 
- [Asset](../primitives/Asset/Asset.md) - kind = 0
- [Transfer](../primitives/Transfer/Transfer.md) - kind = 4
- [Transition](../primitives/Transition/Transition.md) - kind = 1
- [Transaction](../primitives/Transaction/Transaction.md) - kind = 2
- [Voucher](../primitives/Voucher/Voucher.md) - kind = 3
- [GovernanceProposal](../primitives/GovernanceProposal/GovernanceProposal.md) - kind = 5
- [GovernanceVote](../primitives/GovernanceVote/GovernanceVote.md) - kind = 6
- [Instruction](../primitives/Instruction/Instruction.md) - kind = 7
- [Identity](../primitives/Identity/Identity.md) - kind = 8
- [RelayBlock](../primitives/RelayBlock/RelayBlock.md) - kind = 9

## Example

```typescript
const constructor = kindToConstructor('TRANSITION');
```
