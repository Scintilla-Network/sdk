import { describe, it, expect } from '@scintilla-network/litest';
import StateActionData from './StateActionData.js';

import Asset from '../Asset/Asset.js';

const sctAsset = new Asset({
    name: 'Scintilla Token',
    symbol: 'SCT',
    decimals: 18n,
});

const arbitraty = {
    recipient: 'scintilla',
    asset: 'SCT',
    amount: 1000n,
}

describe('StateActionData', () => {
    it('should create a StateActionData instance', () => {
        const stateActionData = new StateActionData();
        console.dir(stateActionData, {depth: null});
        expect(stateActionData.items).toEqual([]);
        const hash = stateActionData.toHash();
        expect(hash).to.be('96a296d224f285c67bee93c30f8a309157f0daa35dc5b87e410b78630a09cfc7')
    });

    it('should create a StateActionData instance with an Asset', () => {
        const stateActionData = new StateActionData([sctAsset]);
        expect(stateActionData.items).toEqual([sctAsset]);
        const hash = stateActionData.toHash();
        expect(hash).to.be('7f2109f5d848fe51f82ff65bbadf93f8156b09bf78512e27ca860a1c40560358')

        const stateActionData2 = new StateActionData(sctAsset);
        expect(stateActionData2.toJSON()).toEqual({items: [sctAsset.toJSON()]});
        const hash2 = stateActionData2.toHash();
        expect(hash2).to.be('7f2109f5d848fe51f82ff65bbadf93f8156b09bf78512e27ca860a1c40560358')

        const parsed = StateActionData.fromUint8Array(stateActionData2.toUint8Array());
        expect(parsed.toHash()).to.be('7f2109f5d848fe51f82ff65bbadf93f8156b09bf78512e27ca860a1c40560358')
    });

    it('should create a StateActionData instance with an arbitrary item', () => {
        const stateActionData = new StateActionData([arbitraty]);
        const hash = stateActionData.toHash();
        expect(hash).to.be('f5633b7feccd2a81fbda484547031a49cfbcd45d42ac5e0d3b8a049ebdf55f4d')

        const parsed = StateActionData.fromUint8Array(stateActionData.toUint8Array());
        expect(parsed.toHash()).to.be('f5633b7feccd2a81fbda484547031a49cfbcd45d42ac5e0d3b8a049ebdf55f4d')
    });

    it('should create a StateActionData instance with an arbitrary item', () => {
        const stateActionData = new StateActionData([arbitraty, sctAsset]);
        const hash = stateActionData.toHash();
        expect(hash).to.be('22a395b9267d307e7bbe5520932d5aa4aa1732b8add23f825cb0edea33d7c170')

        const parsed = StateActionData.fromUint8Array(stateActionData.toUint8Array());
        expect(parsed.toHash()).to.be('22a395b9267d307e7bbe5520932d5aa4aa1732b8add23f825cb0edea33d7c170')
    });
});