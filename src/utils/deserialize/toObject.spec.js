import { describe, it, expect } from '@scintilla-network/litest';
import { toObject } from './toObject.js';
import { fromObject } from '../serialize/fromObject.js';
import { uint8array } from '@scintilla-network/keys/utils';

describe('toObject', () => {
    it('should deserialize an empty object', () => {
        const original = {};
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize object with string field', () => {
        const original = { name: 'test' };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize object with number field', () => {
        const original = { count: 42 };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize object with bigint field', () => {
        const original = { amount: 1000n };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize object with multiple fields', () => {
        const original = { name: 'test', count: 42, amount: 1000n };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize object with array', () => {
        const original = { items: [1, 2, 3] };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize nested object', () => {
        const original = { nested: { value: 42 } };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize complex nested structure', () => {
        const original = {
            name: 'test',
            data: {
                values: [1, 2, 3],
                meta: { id: 42 }
            }
        };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize object with array of objects', () => {
        const original = { items: [{ a: 1 }, { b: 2 }] };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array of objects (the failing case)', () => {
        const original = [{ a: [{ b: 3 }] }];
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should correctly calculate length', () => {
        const original = { a: 1, b: 'test', c: 100n };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        
        // The length should match exactly what was serialized
        expect(result.length).toBe(serialized.length);
        expect(result.value).toEqual(original);
        
        // Verify we consumed exactly the right number of bytes
        expect(result.length).toBe(serialized.value.length);
    });

    it('should handle objects with sorted field names', () => {
        // Fields should be sorted alphabetically during serialization
        const original = { z: 1, a: 2, m: 3 };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
    });

    it('should deserialize deeply nested structures', () => {
        const original = {
            level1: {
                level2: {
                    level3: {
                        value: 'deep'
                    }
                }
            }
        };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize object with boolean fields', () => {
        const original = { isActive: true, isDeleted: false, count: 42 };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value.isActive).toBe(true);
        expect(result.value.isDeleted).toBe(false);
        expect(result.value.count).toBe(42);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize object with mixed types including booleans', () => {
        const original = {
            name: 'test',
            active: true,
            count: 42,
            amount: 1000n,
            flags: [true, false, true]
        };
        const serialized = fromObject(original);
        const result = toObject(serialized.value);
        expect(result.value.name).toBe('test');
        expect(result.value.active).toBe(true);
        expect(result.value.count).toBe(42);
        expect(result.value.amount).toBe(1000n);
        expect(result.value.flags).toEqual([true, false, true]);
        expect(result.length).toBe(serialized.length);
    });
});

