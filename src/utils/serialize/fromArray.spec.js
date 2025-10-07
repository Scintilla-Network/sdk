import { describe, it, expect } from '@scintilla-network/litest';
import { fromArray } from './fromArray.js';
import { uint8array } from '@scintilla-network/keys/utils';

describe('fromArray', () => {
    it('should serialize an empty array', () => {
        const result = fromArray([]);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize array of numbers', () => {
        const result = fromArray([1, 2, 3]);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize array of strings', () => {
        const result = fromArray(['a', 'b', 'c']);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize array of bigints', () => {
        const result = fromArray([1n, 2n, 3n]);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize mixed type array', () => {
        const result = fromArray([1, 'hello', 100n]);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize nested arrays', () => {
        const result = fromArray([[1, 2], [3, 4]]);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize array of objects', () => {
        const result = fromArray([{ a: 1 }, { b: 2 }]);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize array of booleans', () => {
        const result = fromArray([true, false, true]);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should serialize mixed array with booleans', () => {
        const result = fromArray([true, 42, 'test', false, 1000n]);
        expect(result.value).toBeInstanceOf(Uint8Array);
        expect(result.length).toBeGreaterThan(0);
    });
});
