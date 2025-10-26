// import { describe, it, expect, beforeEach } from 'vitest';
import { describe, it, expect, beforeEach } from '@scintilla-network/litest';
import DriveData from './DriveData.js';

describe('DriveData', () => {
    let driveData;

    beforeEach(() => {
        // Reset driveData before each test
        driveData = new DriveData({
            type: 'text',
            content: 'Hello, World!',
        });
    });

    describe('initialization', () => {
        it('initializes correctly with default values', () => {
            const defaultDriveData = new DriveData();
            expect(defaultDriveData.type).toBe('text');
            expect(defaultDriveData.content).toBe('');
        });

        it('initializes correctly with provided options', () => {
            expect(driveData.type).toBe('text');
            expect(driveData.content).toBe('Hello, World!');
        });

        it('initializes correctly with empty content', () => {
            const data = new DriveData({ type: 'text', content: '' });
            expect(data.type).toBe('text');
            expect(data.content).toBe('');
        });

        it('accepts all valid standard types', () => {
            const validTypes = DriveData.getValidTypes();
            validTypes.forEach(type => {
                const data = new DriveData({ type, content: 'test' });
                expect(data.type).toBe(type);
                expect(data.content).toBe('test');
            });
        });

        it('accepts other-based custom types', () => {
            const customTypes = ['other:pdf', 'other:xml', 'other:custom-format', 'other:my_type.1-2'];
            customTypes.forEach(type => {
                const data = new DriveData({ type, content: 'test' });
                expect(data.type).toBe(type);
                expect(data.content).toBe('test');
            });
        });

        it('rejects empty type', () => {
            expect(() => {
                new DriveData({ type: '', content: 'test' });
            }).toThrow();
        });

        it('rejects invalid types', () => {
            const invalidTypes = ['invalid', 'text2', 'json-file', '', 'other:', 'other:'];
            invalidTypes.forEach(type => {
                expect(() => {
                    new DriveData({ type, content: 'test' });
                }).toThrow();
            });
        });

        it('rejects types with invalid characters in other format', () => {
            const invalidOtherTypes = ['other:invalid@type', 'other:invalid space', 'other:invalid/type'];
            invalidOtherTypes.forEach(type => {
                expect(() => {
                    new DriveData({ type, content: 'test' });
                }).toThrow();
            });
        });

        it('validates types in fromJSON method', () => {
            expect(() => {
                DriveData.fromJSON({ type: 'invalid-type', content: 'test' });
            }).toThrow();

            expect(() => {
                DriveData.fromJSON({ type: '', content: 'test' });
            }).toThrow();

            const validData = DriveData.fromJSON({ type: 'json', content: 'test' });
            expect(validData.type).toBe('json');
            expect(validData.content).toBe('test');
        });
    });

    describe('JSON conversion', () => {
        it('converts to JSON correctly', () => {
            const expectedJSON = {
                type: 'text',
                content: 'Hello, World!',
            };
            expect(driveData.toJSON()).toEqual(expectedJSON);
        });

        it('converts default DriveData to JSON correctly', () => {
            const defaultData = new DriveData();
            const expectedJSON = {
                type: 'text',
                content: '',
            };
            expect(defaultData.toJSON()).toEqual(expectedJSON);
        });

        it('creates from JSON correctly', () => {
            const json = { type: 'json', content: 'test content' };
            const data = DriveData.fromJSON(json);
            expect(data.type).toBe('json');
            expect(data.content).toBe('test content');
        });
    });

    describe('type validation', () => {
        it('returns valid types list', () => {
            const validTypes = DriveData.getValidTypes();
            expect(Array.isArray(validTypes)).toBe(true);
            expect(validTypes).toContain('text');
            expect(validTypes).toContain('json');
            expect(validTypes).toContain('binary');
            expect(validTypes).toContain('document');
            expect(validTypes).toContain('image');
            expect(validTypes).toContain('video');
        });

        it('validates types correctly', () => {
            const validTypes = DriveData.getValidTypes();
            validTypes.forEach(type => {
                expect(DriveData.isValidType(type)).toBe(true);
            });

            const customTypes = ['other:pdf', 'other:xml', 'other:custom'];
            customTypes.forEach(type => {
                expect(DriveData.isValidType(type)).toBe(true);
            });

            expect(DriveData.isValidType('invalid')).toBe(false);
            expect(DriveData.isValidType('')).toBe(false); // Empty type no longer allowed
            expect(DriveData.isValidType(null)).toBe(false);
            expect(DriveData.isValidType(undefined)).toBe(false);
        });

    });

    describe('binary serialization', () => {
        it('converts to uint8Array correctly', () => {
            const array = driveData.toUint8Array();
            expect(array).toBeInstanceOf(Uint8Array);
            expect(array.length).toBeGreaterThan(0);
        });

        it('converts empty content to uint8Array correctly', () => {
            const emptyContentData = new DriveData({ type: 'text', content: '' });
            const array = emptyContentData.toUint8Array();
            expect(array).toBeInstanceOf(Uint8Array);
            expect(array.length).toBeGreaterThan(0);
        });

        it('converts to hex correctly', () => {
            const hex = driveData.toHex();
            expect(hex).toBeDefined();
            expect(hex).toBe('04746578740d48656c6c6f2c20576f726c6421');
        });

        it('converts empty content DriveData to hex correctly', () => {
            const emptyContentData = new DriveData({ type: 'text', content: '' });
            const hex = emptyContentData.toHex();
            expect(hex).toBeDefined();
            expect(hex).toBe('047465787400');
        });
    });

    describe('deserialization', () => {
        it('import from hex correctly', () => {
            const parsed = DriveData.fromHex(driveData.toHex());
            expect(parsed).toBeDefined();
            expect(parsed.type).toBe(driveData.type);
            expect(parsed.content).toBe(driveData.content);
            expect(parsed.toHex()).toBe(driveData.toHex());
        });

        it('import from uint8Array correctly', () => {
            const parsed = DriveData.fromUint8Array(driveData.toUint8Array());
            expect(parsed).toBeDefined();
            expect(parsed.type).toBe(driveData.type);
            expect(parsed.content).toBe(driveData.content);
            expect(parsed.toUint8Array()).toEqual(driveData.toUint8Array());
        });

        it('roundtrip serialization works correctly', () => {
            const original = new DriveData({ type: 'document', content: 'test content' });
            const serialized = original.toUint8Array();
            const deserialized = DriveData.fromUint8Array(serialized);

            expect(deserialized.type).toBe(original.type);
            expect(deserialized.content).toBe(original.content);
            expect(deserialized.toJSON()).toEqual(original.toJSON());
        });

        it('throws error for empty hex', () => {
            expect(() => {
                DriveData.fromHex('0000');
            }).toThrow();
        });

        it('throws error for empty uint8Array', () => {
            expect(() => {
                DriveData.fromUint8Array(new Uint8Array([0, 0])); // Empty string + empty string
            }).toThrow();
        });

        it('throws error for invalid type during deserialization', () => {
            expect(() => {
                DriveData.fromUint8Array(new Uint8Array([255]));
            }).toThrow();
        });
    });

    describe('hash generation', () => {
        it('generates a hash correctly', () => {
            const hash = driveData.toHash('hex');
            expect(hash).toBeDefined();
            expect(hash).toBe('87ffcf81e64343908cc0a5db9961f25295ee994aa8706256e25de7858924f4d6');
        });

        it('generates consistent hashes for same content', () => {
            const data1 = new DriveData({ type: 'text', content: 'Hello, World!' });
            const data2 = new DriveData({ type: 'text', content: 'Hello, World!' });

            expect(data1.toHash('hex')).toBe(data2.toHash('hex'));
        });

        it('generates different hashes for different content', () => {
            const data1 = new DriveData({ type: 'text', content: 'Hello, World!' });
            const data2 = new DriveData({ type: 'text', content: 'Different content' });

            expect(data1.toHash('hex')).not.toBe(data2.toHash('hex'));
        });

        it('generates different hashes for different types', () => {
            const data1 = new DriveData({ type: 'text', content: 'Hello, World!' });
            const data2 = new DriveData({ type: 'binary', content: 'Hello, World!' });

            expect(data1.toHash('hex')).not.toBe(data2.toHash('hex'));
        });

        it('returns hash as Uint8Array when requested', () => {
            const hashArray = driveData.toHash('uint8array');
            expect(hashArray).toBeInstanceOf(Uint8Array);
            expect(hashArray.length).toBe(32); // SHA-256 produces 32 bytes
        });
    });

    describe('error handling', () => {
        it('throws error for malformed hex input', () => {
            expect(() => {
                DriveData.fromHex('invalid_hex');
            }).toThrow();
        });

        it('throws error for empty uint8Array input', () => {
            expect(() => {
                DriveData.fromUint8Array(new Uint8Array(0));
            }).toThrow();
        });

        it('throws error for malformed uint8Array input', () => {
            expect(() => {
                DriveData.fromUint8Array(new Uint8Array([255])); // Invalid data
            }).toThrow();
        });

        it('throws error for insufficient data length', () => {
            expect(() => {
                DriveData.fromUint8Array(new Uint8Array([0])); // Only one byte
            }).toThrow();
        });
    });

    describe('string representation', () => {
        it('toString returns hex representation', () => {
            expect(driveData.toString()).toBe(driveData.toHex());
        });

        it('toString works for default DriveData', () => {
            const defaultData = new DriveData();
            expect(defaultData.toString()).toBe(defaultData.toHex());
        });
    });

});
