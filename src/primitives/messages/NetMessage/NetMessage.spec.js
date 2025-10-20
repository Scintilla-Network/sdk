import { describe, it, expect } from '@scintilla-network/litest';
import { uint8array } from '@scintilla-network/keys/utils';
import { CHAIN_SCINTILLA_1_MAGIC } from '../../../CONSTANTS.js';
import NetMessage from './NetMessage.js';


describe('NetMessage', () => {
    let emptyMessage;
    it('should create a net message', () => {
        emptyMessage = new NetMessage({
            version: 1
        });
        expect(emptyMessage).toBeDefined();
        expect(emptyMessage.chain).to.equal(CHAIN_SCINTILLA_1_MAGIC);
        expect(emptyMessage.version).to.equal(1);
        expect(emptyMessage.kind).to.equal('UNKNOWN');
        expect(emptyMessage.cluster).to.equal('unknown');
        expect(emptyMessage.payload).to.be.null;
        expect(emptyMessage.length).to.equal(0);
    });
    it('should allow to get hash', () => {
        const hash = emptyMessage.toHash('hex');
        expect(hash).toBeDefined();
        expect(hash).to.equal('cb0c82fc6c5b579da7d65bccf60825d85deea29aaa95dae418606664148f8f5c');
    });
    it('should allow to get hex', () => {
        const hex = emptyMessage.toHex();
        expect(hex).to.equal('a1d691a8000107756e6b6e6f776ee3b0c44200');
    });
    it('should allow to parse from hex', () => {
        const message = NetMessage.fromHex('a1d691a8000107756e6b6e6f776ee3b0c44200');
        expect(message).toBeDefined();
        expect(message.chain).to.deep.equal(CHAIN_SCINTILLA_1_MAGIC);
        expect(message.kind).to.equal('UNKNOWN');
        expect(message.cluster).to.equal('unknown');
        expect(message.toHash('hex')).to.equal('cb0c82fc6c5b579da7d65bccf60825d85deea29aaa95dae418606664148f8f5c');
        expect(message.toHex()).to.equal('a1d691a8000107756e6b6e6f776ee3b0c44200');
    });
    it('should allow to get uint8array', () => {
        const array = emptyMessage.toUint8Array();
        expect(array).toBeDefined();
        expect(array.length).to.equal(19);
        expect(uint8array.toHex(array)).to.equal('a1d691a8000107756e6b6e6f776ee3b0c44200');
    });
    it('should create a net message with kind and cluster', () => {
        const netMessage = new NetMessage({
            kind: 'PEER_INFO',
            cluster: 'core.banking',
        });

        netMessage.setPayload(new Uint8Array([2, 4, 8, 16, 32]));
        expect(netMessage.payload).to.deep.equal(new Uint8Array([2, 4, 8, 16, 32]));

        const parsed = NetMessage.fromUint8Array(netMessage.toUint8Array());
        expect(parsed.kind).to.equal('UNKNOWN');
        expect(parsed.cluster).to.equal('core.banking');
        expect(parsed.payload).to.deep.equal(new Uint8Array([2, 4, 8, 16, 32]));
        expect(parsed.toHash('hex')).to.equal('daeed319bdcb6908b7260b421bf488bffd18126fb5ab8191d442d689c3ef5b58');
        expect(parsed.toHex()).to.equal('a1d691a800010c636f72652e62616e6b696e67e11e89ae050204081020');


        const parsed2 = NetMessage.fromHex('a1d691a800010c636f72652e62616e6b696e67e11e89ae050204081020');
        expect(parsed2.kind).to.equal('UNKNOWN');
        expect(parsed2.cluster).to.equal('core.banking');
        expect(parsed2.payload).to.deep.equal(new Uint8Array([2, 4, 8, 16, 32]));
        expect(parsed2.toHash('hex')).to.equal('daeed319bdcb6908b7260b421bf488bffd18126fb5ab8191d442d689c3ef5b58');
        expect(parsed2.toHex()).to.equal('a1d691a800010c636f72652e62616e6b696e67e11e89ae050204081020');

        const netMessage2 = new NetMessage({
            kind: 'PEERINFO',
            cluster: 'core.banking',
            payload: new Uint8Array([2, 4, 8, 16, 32]),
        });
        expect(netMessage2.payload).to.deep.equal(new Uint8Array([2, 4, 8, 16, 32]));
        expect(netMessage2.toHash('hex')).to.equal('ac224bc4c25efd09cb6477fbc263f3d8958d2f2cfaf597a4a99eff588ab74464');
        expect(netMessage2.toHex()).to.equal('a1d691a801010c636f72652e62616e6b696e67e11e89ae050204081020');
        const parsed3 = NetMessage.fromUint8Array(netMessage2.toUint8Array());
        expect(parsed3.kind).to.equal('PEERINFO');
        expect(parsed3.cluster).to.equal('core.banking');
        expect(parsed3.payload).to.deep.equal(new Uint8Array([2, 4, 8, 16, 32]));
        expect(parsed3.toHash('hex')).to.equal('ac224bc4c25efd09cb6477fbc263f3d8958d2f2cfaf597a4a99eff588ab74464');
        expect(parsed3.toHex()).to.equal('a1d691a801010c636f72652e62616e6b696e67e11e89ae050204081020');
    });
});