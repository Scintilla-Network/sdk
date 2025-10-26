import { describe, it, expect } from '@scintilla-network/litest';
import Instruction from './Instruction.js';

describe('Instruction', () => {
    describe('initialization', () => {
        it('initializes correctly with default values', () => {
            const instruction = new Instruction();
            expect(instruction.kind).toBe('INSTRUCTION');
            expect(instruction.data).toEqual({});
        });

        it('initializes correctly with provided data', () => {
            const data = {
                asset: 'SCT',
                amount: 1000n,
                recipient: 'scintilla',
                version: 1
            };
            const instruction = new Instruction({ data });
            expect(instruction.kind).toBe('INSTRUCTION');
            expect(instruction.data).toEqual(data);
        });

        it('initializes correctly with empty data object', () => {
            const instruction = new Instruction({ data: {} });
            expect(instruction.kind).toBe('INSTRUCTION');
            expect(instruction.data).toEqual({});
        });
    });

    describe('JSON conversion', () => {
        it('converts to JSON correctly', () => {
            const data = {
                asset: 'SCT',
                amount: 1000n,
                recipient: 'scintilla'
            };
            const instruction = new Instruction({ data });
            const expectedJSON = {
                kind: 'INSTRUCTION',
                data: data,
            };
            expect(instruction.toJSON()).toEqual(expectedJSON);
        });

        it('creates from JSON correctly', () => {
            const json = {
                kind: 'INSTRUCTION',
                data: {
                    asset: 'SCT',
                    amount: 1000n,
                    recipient: 'scintilla'
                }
            };
            const instruction = Instruction.fromJSON(json);
            expect(instruction.kind).toBe('INSTRUCTION');
            expect(instruction.data).toEqual(json.data);
        });
    });

    describe('binary serialization', () => {
        it('converts to uint8Array correctly', () => {
            const instruction = new Instruction({
                data: {
                    asset: 'SCT',
                    amount: 1000n,
                    recipient: 'scintilla',
                    version: 1
                }
            });
            const array = instruction.toUint8Array();
            expect(array).toBeInstanceOf(Uint8Array);
            expect(array.length).toBeGreaterThan(0);
        });

        it('converts to hex correctly', () => {
            const instruction = new Instruction({
                data: {
                    asset: 'SCT',
                    amount: 1000n,
                    recipient: 'scintilla',
                    version: 1
                }
            });
            const hex = instruction.toHex();
            expect(hex).toBeDefined();
            expect(typeof hex).toBe('string');
        });

        it('excludes kind prefix when requested', () => {
            const instruction = new Instruction({
                data: {
                    asset: 'SCT',
                    amount: 1000n,
                    recipient: 'scintilla',
                    version: 1
                }
            });
            const arrayWithKind = instruction.toUint8Array();
            const arrayWithoutKind = instruction.toUint8Array({ excludeKindPrefix: true });

            expect(arrayWithoutKind.length).toBeLessThan(arrayWithKind.length);
        });
    });

    describe('deserialization', () => {
        it('import from hex correctly', () => {
            const instruction = new Instruction({
                data: {
                    asset: 'SCT',
                    amount: 1000n,
                    recipient: 'scintilla',
                    version: 1
                }
            });
            const hex = instruction.toHex();
            const parsed = Instruction.fromHex(hex);

            expect(parsed.kind).toBe(instruction.kind);
            expect(parsed.data).toEqual(instruction.data);
        });

        it('import from uint8Array correctly', () => {
            const instruction = new Instruction({
                data: {
                    asset: 'SCT',
                    amount: 1000n,
                    recipient: 'scintilla',
                    version: 1
                }
            });
            const array = instruction.toUint8Array();
            const parsed = Instruction.fromUint8Array(array);

            expect(parsed.kind).toBe(instruction.kind);
            expect(parsed.data).toEqual(instruction.data);
        });

        it('roundtrip serialization works correctly', () => {
            const originalData = {
                asset: 'SCT',
                amount: 5000n,
                recipient: 'test-user',
                version: 2,
                metadata: { priority: 'high' }
            };
            const original = new Instruction({ data: originalData });
            const serialized = original.toUint8Array();
            const deserialized = Instruction.fromUint8Array(serialized);

            expect(deserialized.kind).toBe(original.kind);
            expect(deserialized.data).toEqual(original.data);
            expect(deserialized.toJSON()).toEqual(original.toJSON());
        });

        it('maintains data field order consistency', () => {
            const data1 = { asset: 'SCT', amount: 1000n, recipient: 'scintilla' };
            const data2 = { recipient: 'scintilla', asset: 'SCT', amount: 1000n };

            const instruction1 = new Instruction({ data: data1 });
            const instruction2 = new Instruction({ data: data2 });

            // Both should serialize to the same result due to alphabetical ordering
            expect(instruction1.toUint8Array()).toEqual(instruction2.toUint8Array());
        });

        it('handles empty data object', () => {
            const instruction = new Instruction({ data: {} });
            const array = instruction.toUint8Array();
            const parsed = Instruction.fromUint8Array(array);

            expect(parsed.data).toEqual({});
        });
    });

    describe('hash generation', () => {
        it('generates a hash correctly', () => {
            const instruction = new Instruction({
                data: {
                    asset: 'SCT',
                    amount: 1000n,
                    recipient: 'scintilla'
                }
            });
            const hash = instruction.toHash('hex');
            expect(hash).toBeDefined();
            expect(typeof hash).toBe('string');
        });

        it('generates consistent hashes for same data', () => {
            const data = {
                asset: 'SCT',
                amount: 1000n,
                recipient: 'scintilla'
            };

            const instruction1 = new Instruction({ data });
            const instruction2 = new Instruction({ data });

            expect(instruction1.toHash('hex')).toBe(instruction2.toHash('hex'));
        });

        it('generates different hashes for different data', () => {
            const instruction1 = new Instruction({
                data: {
                    asset: 'SCT',
                    amount: 1000n,
                    recipient: 'scintilla'
                }
            });
            const instruction2 = new Instruction({
                data: {
                    asset: 'SCT',
                    amount: 2000n,
                    recipient: 'scintilla'
                }
            });

            expect(instruction1.toHash('hex')).not.toBe(instruction2.toHash('hex'));
        });

        it('returns hash as Uint8Array when requested', () => {
            const instruction = new Instruction({
                data: {
                    asset: 'SCT',
                    amount: 1000n,
                    recipient: 'scintilla'
                }
            });
            const hashArray = instruction.toHash('uint8array');
            expect(hashArray).toBeInstanceOf(Uint8Array);
            expect(hashArray.length).toBe(32); // SHA-256 produces 32 bytes
        });
    });

    describe('data type support', () => {
        it('handles string values correctly', () => {
            const data = {
                asset: 'SCT',
                recipient: 'scintilla',
                description: 'test transaction'
            };
            const instruction = new Instruction({ data });
            const parsed = Instruction.fromUint8Array(instruction.toUint8Array());

            expect(parsed.data.asset).toBe('SCT');
            expect(parsed.data.recipient).toBe('scintilla');
            expect(parsed.data.description).toBe('test transaction');
        });

        it('handles bigint values correctly', () => {
            const data = {
                asset: 'SCT',
                amount: 1000000000000n, // 1 trillion
                recipient: 'scintilla'
            };
            const instruction = new Instruction({ data });
            const parsed = Instruction.fromUint8Array(instruction.toUint8Array());

            expect(parsed.data.amount).toBe(1000000000000n);
        });

        it('handles number values correctly', () => {
            const data = {
                asset: 'SCT',
                version: 1,
                priority: 5,
                recipient: 'scintilla'
            };
            const instruction = new Instruction({ data });
            const parsed = Instruction.fromUint8Array(instruction.toUint8Array());

            expect(parsed.data.version).toBe(1);
            expect(parsed.data.priority).toBe(5);
        });

        it('handles object values correctly', () => {
            const data = {
                asset: 'SCT',
                metadata: {
                    priority: 'high',
                    tags: ['important', 'system']
                },
                recipient: 'scintilla'
            };
            const instruction = new Instruction({ data });
            const parsed = Instruction.fromUint8Array(instruction.toUint8Array());

            expect(parsed.data.metadata).toEqual({
                priority: 'high',
                tags: ['important', 'system']
            });
        });
    });

    describe('error handling', () => {
        it('throws error for invalid kind', () => {
            // Create a malformed array with wrong kind
            const malformedArray = new Uint8Array([1, 0]); // Kind 1 instead of 21
            expect(() => {
                Instruction.fromUint8Array(malformedArray);
            }).toThrow('Invalid instruction kind');
        });

        it('throws error for malformed hex input', () => {
            expect(() => {
                Instruction.fromHex('invalid_hex');
            }).toThrow();
        });

        it('throws error for empty uint8Array input', () => {
            expect(() => {
                Instruction.fromUint8Array(new Uint8Array(0));
            }).toThrow();
        });
    });

    describe('string representation', () => {
        it('toString returns hex representation', () => {
            const instruction = new Instruction({
                data: {
                    asset: 'SCT',
                    amount: 1000n,
                    recipient: 'scintilla'
                }
            });
            expect(instruction.toString()).toBe(instruction.toHex());
        });
    });

    describe('original test case', () => {
        it('should have a toUint8Array method', () => {
            const instruction = new Instruction({
                kind: 'INSTRUCTION',
                data: {
                        asset: 'SCT',
                        amount: 4444n * 10n**9n,
                        recipient: 'scintilla',
                        version: 1
                }
            });
            const array = instruction.toUint8Array();
            const parsed = Instruction.fromUint8Array(array);

            const hash = instruction.toHash();
            const parsedHash = parsed.toHash();
            expect(hash).toEqual(parsedHash);
        });
    });

});