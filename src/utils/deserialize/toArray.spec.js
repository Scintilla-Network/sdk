import { describe, it, expect } from '@scintilla-network/litest';
import {toArray} from './toArray.js';
import {fromArray} from '../serialize/fromArray.js';
import { uint8array } from '@scintilla-network/keys/utils';

describe('toArray', () => {
    it('should deserialize an empty array', () => {
        const serialized = fromArray([]);
        const result = toArray(serialized.value);
        expect(result.value).toBeInstanceOf(Array);
        expect(result.value.length).toBe(0);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array of numbers', () => {
        const original = [1, 2, 3];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array of strings', () => {
        const original = ['hello', 'world', 'test'];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array of bigints', () => {
        const original = [1n, 100n, 10000n];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize mixed type array', () => {
        const original = [42, 'test', 100n];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize nested arrays', () => {
        const original = [[1, 2], [3, 4]];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize deeply nested arrays', () => {
        const original = [[[1, 2]], [[3, 4]]];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array with single element', () => {
        const original = [42];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array of objects', () => {
        const original = [{ a: 1 }, { b: 2 }];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array with nested objects', () => {
        const original = [{ nested: { value: 42 } }];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array with mixed nested structures', () => {
        const original = [
            { a: 1 },
            [2, 3],
            'string',
            100n,
            { nested: [4, 5] }
        ];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize large array', () => {
        const original = Array.from({ length: 100 }, (_, i) => i);
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array with empty strings', () => {
        const original = ['', 'test', ''];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array with zero values', () => {
        const original = [0, 0n, 1, 2];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize complex nested structure (the original failing case)', () => {
        const original = [{ a: [{ b: 3 }] }];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should correctly calculate length for nested structures', () => {
        const original = [[1, 2, 3], [4, 5, 6]];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        
        // The length should match exactly what was serialized
        expect(result.length).toBe(serialized.length);
        expect(result.value).toEqual(original);
        
        // Verify we consumed exactly the right number of bytes
        expect(result.length).toBe(serialized.value.length);
    });

    it('should handle array with multiple object types', () => {
        const original = [
            { id: 1, name: 'first' },
            { id: 2, name: 'second', extra: 'field' },
            { id: 3 }
        ];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize array of booleans', () => {
        const original = [true, false, true, false];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });

    it('should deserialize mixed array with booleans', () => {
        const original = [true, 42, 'test', false, 1000n, [true, false]];
        const serialized = fromArray(original);
        const result = toArray(serialized.value);
        expect(result.value).toEqual(original);
        expect(result.length).toBe(serialized.length);
    });
});

