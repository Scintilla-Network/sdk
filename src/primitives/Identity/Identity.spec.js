// import { describe, it, expect } from '@scintilla-network/litest';
import { describe, it, expect } from '@scintilla-network/litest';
import Identity from './Identity.js';
import { uint8array, json } from '@scintilla-network/keys/utils';

describe('Identity', () => {
    it('initializes with default values when no options are provided', () => {
        const identity = new Identity({
            moniker: 'testuser',
        });
        expect(identity.parent).toBe('sct');
        expect(identity.moniker).toBe('testuser');
        expect(identity.records).toEqual({});
        expect(identity.members).toEqual([]);
    });

    it('initializes with provided values', () => {
        const options = {
            moniker: 'testuser',
            records: { key1: 'value1' },
            members:[['testaddress']]
        };
        const identity = new Identity(options);
        expect(identity.moniker).toBe(options.moniker);
        expect(identity.members).toEqual([ [ 'testaddress', 0, 0, 0, 0, 0, 0 ] ]);
        expect(identity.records).toEqual(options.records);
    });

    it('sets and gets records correctly', () => {
        const identity = new Identity({ moniker: 'user' });
        identity.setRecord('profile.name', 'John Doe');
        identity.setRecord('profile.age', 30);
        expect(identity.records.profile.name).toBe('John Doe');
        expect(identity.records.profile.age).toBe(30);
    });

    it('ensures moniker is alphanumeric, hyphens, or underscores and does not exceed 64 characters', () => {
        const longMoniker = 'a'.repeat(65) + '-_';
        const identity = new Identity({ moniker: longMoniker });
        expect(identity.moniker).toHaveLength(64);
    });

    it('toStore method returns correctly structured object', () => {
        const identity = new Identity({ parent:null,moniker: 'user' });
        identity.setRecord('profile.name', 'John Doe');
        identity.setRecord('profile.age', 30);
        const store = identity.toStore();
        // expect(store).toHaveProperty(`/user/.identity.json`);
        expect(store[`/user/.identity.json`]).toEqual('{"kind":"IDENTITY","parent":null,"moniker":"user","members":[],"records":{"profile":{"name":"John Doe","age":30}}}');
    });

    it('toJSON returns the correct object', () => {
        const options = {
            kind: 'IDENTITY',
            parent: null,
            moniker: 'testuser',
            members:[['testaddress', 0, 0, 0, 0, 0, 0]],
            records: { key1: 'value1' },
        };
        const identity = new Identity(options);
        const json = identity.toJSON();
        expect(json).toEqual(options);
    });

    it('toHex returns the correct Hex', () => {
        const identity = new Identity({ moniker: 'testuser' });
        const hex = identity.toHex();
        expect(hex).toEqual('12084944454e5449545903736374087465737475736572027b7d025b5d');
    });

    it('should be able to provide a hash', () => {
        const identity = new Identity({ moniker: 'testuser' });
        const hash = identity.toHash('hex');
        expect(hash).toEqual('d2109858d36440311e5a4daf0b7a6df023ac67987b5918056185a53c506cc7b6');
    });

    it('toUint8Array returns the correct Uint8Array', () => {
        const identity = new Identity({ moniker: 'testuser' });
        const array = identity.toUint8Array();
        expect(array).toEqual(uint8array.fromHex('12084944454e5449545903736374087465737475736572027b7d025b5d'));
    });

    it('fromUint8Array returns the correct Identity', () => {
        const identity = new Identity({ moniker: 'testuser', records: { key1: 'value1', a: 'b', c: {value: 1}, d: [1, 2n] }, members: [['testaddress', 0, 0, 0, 0, 0, 0]] });
        const identity2 = Identity.fromUint8Array(identity.toUint8Array());
        expect(identity2.moniker).toEqual('testuser');
        expect(identity2.members).toEqual([['testaddress', 0, 0, 0, 0, 0, 0]]);
        // We don't know how to handle big ints, so we convert them to strings FIXME
        expect(json.stringify(identity2.records)).toEqual(json.stringify({  a: 'b', c: {value: 1}, d: [1, '2'], key1: 'value1' }));
        expect(identity2.parent).toEqual('sct');
    });
});
