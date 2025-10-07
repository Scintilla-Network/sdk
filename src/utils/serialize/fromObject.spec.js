import { describe, it, expect } from '@scintilla-network/litest';
import { fromObject } from './fromObject.js';
import { uint8array } from '@scintilla-network/keys/utils';

describe('fromObject', () => {
    it('should serialize an empty object', () => {
        const result = fromObject({});
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize object with string field', () => {
        const result = fromObject({ name: 'test' });
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize object with number field', () => {
        const result = fromObject({ count: 42 });
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize object with bigint field', () => {
        const result = fromObject({ amount: 1000n });
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize object with array field', () => {
        const result = fromObject({ items: [1, 2, 3] });
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize object with nested object', () => {
        const result = fromObject({ nested: { value: 42 } });
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize complex nested structure', () => {
        const obj = {
            name: 'test',
            data: {
                values: [1, 2, 3],
                meta: { id: 42 }
            }
        };
        const result = fromObject(obj);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize object with array of objects', () => {
        const result = fromObject({ items: [{ a: 1 }, { b: 2 }] });
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize array of objects (the failing case)', () => {
        const obj = [{ a: [{ b: 3 }] }];
        const result = fromObject(obj);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize object with boolean fields', () => {
        const result = fromObject({ isActive: true, isDeleted: false, count: 42 });
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize object with mixed types including booleans', () => {
        const obj = {
            name: 'test',
            active: true,
            count: 42,
            amount: 1000n,
            flags: [true, false, true]
        };
        const result = fromObject(obj);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });
});

