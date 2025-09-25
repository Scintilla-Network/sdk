## Asset

Represents a digital or physical asset in a system, providing a structured way to define and interact with assets (ex: tokens).

```js
import {Asset} from '@scintilla/ts-sdk';
```

### Initializing an Asset

```javascript
const myAsset = new Asset({
    name: 'ExampleAsset',
    symbol: 'EXA',
    supply: {
        max: 200_000_000 * 10 ** 8,
    },
    decimals: 8,
    permissions: {
        mint: ['alice'],
        burn: ['alice'],
    },
    fees: [['transfer', {
        percent: 1n,
        max: 100n,
    }]],
    metadata: {
        description: 'A custom asset for testing',
        website: 'https://customasset.scintilla.network'
    }
});
```

#### Properties
- name: The name of the asset.
- symbol: The symbol representing the asset.
- supply: An object containing max, total, and circulating, representing the maximum supply of the asset.
- decimals: The number of decimals the asset uses.
- distribution: An object representing the distribution of the asset (initially empty).
- permissions: An object containing arrays of strings for mint and burn permissions.
- fees: An object describing the fees for transferring the asset.
- metadata: An object containing description and website.
```javascript
const asset = new Asset({
    metadata: {
        description: 'A custom asset for testing',
        website: 'https://customasset.scintilla.network'
    },
});
```

#### Methods

##### static fromUint8Array(uint8Array)
This method creates an Asset instance from a Uint8Array.

```javascript
const asset = Asset.fromUint8Array(uint8Array);
```

##### static fromJSON(json)
This method creates an Asset instance from a JSON object.

```javascript
const asset = Asset.fromJSON(json);
```

##### toUint8Array()
This method returns a Uint8Array representation of the Asset instance.

```javascript
const uint8Array = myAsset.toUint8Array();
```

##### toJSON()
This method returns a JSON representation of the Asset instance.

```javascript
const json = myAsset.toJSON();
```

##### toHash()
This method returns a hash representation of the Asset instance.

```javascript
const hash = myAsset.toHash();
```

##### toHex()
This method returns a hexadecimal representation of the Asset instance, including all properties.

```javascript
const hex = myAsset.toHex();
```

##### toUint8Array()
This method returns a Uint8Array representation of the Asset instance, including all properties.

```javascript
const uint8Array = myAsset.toUint8Array();
```
