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
        expect(stateActionData.items).toEqual([]);
        const hash = stateActionData.toHash('hex');
        expect(hash).to.be('96a296d224f285c67bee93c30f8a309157f0daa35dc5b87e410b78630a09cfc7')
    });

    it('should create a StateActionData instance with an Asset', () => {
        const stateActionData = new StateActionData([sctAsset]);
        expect(stateActionData.items).toEqual([sctAsset]);
        const hash = stateActionData.toHash('hex');
        expect(hash).to.be('03f6f4103e40d7cbec6e1ddd77168ad3c453e3afd6724bbb8a54c1bf9e549690')

        const stateActionData2 = new StateActionData(sctAsset);
        expect(stateActionData2.toJSON()).toEqual({kind: 'STATEACTIONDATA', items: [sctAsset.toJSON()]});
        const hash2 = stateActionData2.toHash('hex');
        expect(hash2).to.be('03f6f4103e40d7cbec6e1ddd77168ad3c453e3afd6724bbb8a54c1bf9e549690')

        const parsed = StateActionData.fromUint8Array(stateActionData2.toUint8Array());
        expect(parsed.toHash('hex')).to.be('03f6f4103e40d7cbec6e1ddd77168ad3c453e3afd6724bbb8a54c1bf9e549690')
    });

    it('should create a StateActionData instance with an arbitrary item', () => {
        const stateActionData = new StateActionData([arbitraty]);
        const hash = stateActionData.toHash('hex');
        expect(hash).to.be('f5633b7feccd2a81fbda484547031a49cfbcd45d42ac5e0d3b8a049ebdf55f4d')

        const parsed = StateActionData.fromUint8Array(stateActionData.toUint8Array());
        expect(parsed.toHash('hex')).to.be('f5633b7feccd2a81fbda484547031a49cfbcd45d42ac5e0d3b8a049ebdf55f4d')
    });

    it('should create a StateActionData instance with an arbitrary item', () => {
        const stateActionData = new StateActionData([arbitraty, sctAsset]);
        const hash = stateActionData.toHash('hex');
        expect(hash).to.be('1c999678da2219adca0913b01120af7a459ebbf9d6a9ddf437eb6b5f67c6ff66')

        const parsed = StateActionData.fromUint8Array(stateActionData.toUint8Array());
        expect(parsed.toHash('hex')).to.be('1c999678da2219adca0913b01120af7a459ebbf9d6a9ddf437eb6b5f67c6ff66')
    });
});