### Transition

A transition is a message that is used to transition the state of the system.

### Installation
```js
import { Transition } from '@scintilla/ts-sdk';
```

### Initializing a Transition
```typescript
const transition = new Transition({
   cluster: 'core.identity',
    type: 'IDENTITY',
    action: 'CREATE',
    timestamp: 1707826561431 + 20000,
    data: [{
        parent: null,
        moniker: 'core',
        members: [
            ['sct.scintilla-labs', 1]
        ]
    }]
});
```

#### Properties 
- `cluster`: The cluster of the transition
- `type`: The type of the transition
- `action`: The action of the transition
- `timestamp`: The timestamp of the transition
- `data`: The data of the transition
- `authorizations`: The authorizations of the transition
- `fees`: The fees of the transition
- `timelock`: The timelock of the transition

#### Methods

##### `computeHash()`
Computes the unique hash identifier for the transition:
```typescript
const hash = transition.computeHash();
```

##### `toUint8Array()`
Converts the transition to a Uint8Array:
```typescript
const uint8Array = transition.toUint8Array();
```

##### `toJSON()`
Converts the transition to a JSON object:
```typescript
const json = transition.toJSON();
``` 

##### `toBase64()`
Converts the transition to a base64 string:
```typescript
const base64 = transition.toBase64();
```

##### `toSignableMessage()`
Converts the transition to a signable message:
```typescript
const signableMessage = transition.toSignableMessage();
```     

##### `addAuthorization()`
Adds an authorization to the transition:
```typescript
transition.addAuthorization(authorization);
```

##### `verifySignature()`
Verifies the signature of the transition:
```typescript
const isValid = transition.verifySignature();
```

##### `validate()`
Validates the transition:
```typescript
const isValid = transition.validate();
```

##### `isValid()`
Checks if the transition is valid:
```typescript
const isValid = transition.isValid();
```