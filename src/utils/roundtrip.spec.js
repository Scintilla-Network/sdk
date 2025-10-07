import { describe, it, expect } from '@scintilla-network/litest';
import fromObject from './serialize/fromObject.js';
import toObject from './deserialize/toObject.js';
import fromArray from './serialize/fromArray.js';
import toArray from './deserialize/toArray.js';

describe('Round-trip serialization', () => {
    it('should round-trip simple object', () => {
        const obj = { name: 'test' };
        const serialized = fromObject(obj);
        const deserialized = toObject(serialized.value);
        expect(deserialized.value).toEqual(obj);
        expect(deserialized.length).toBe(serialized.length);
    });

    it('should round-trip object with array', () => {
        const obj = { items: [1, 2, 3] };
        const serialized = fromObject(obj);
        const deserialized = toObject(serialized.value);
        expect(deserialized.value).toEqual(obj);
        expect(deserialized.length).toBe(serialized.length);
    });

    it('should round-trip nested object', () => {
        const obj = { nested: { value: 42 } };
        const serialized = fromObject(obj);
        const deserialized = toObject(serialized.value);
        expect(deserialized.value).toEqual(obj);
        expect(deserialized.length).toBe(serialized.length);
    });

    it('should round-trip array of objects (THE FAILING CASE)', () => {
        const obj = [{ a: [{ b: 3 }] }];
        const serialized = fromObject(obj);
        const deserialized = toObject(serialized.value);
        expect(deserialized.value).toEqual(obj);
        expect(deserialized.length).toBe(serialized.length);
    });
});

