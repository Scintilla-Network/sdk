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

    it('initializes correctly with default values', () => {
        const defaultDriveData = new DriveData();
        expect(defaultDriveData.type).toBe('text');
        expect(defaultDriveData.content).toBe('');
    });

    it('initializes correctly with provided options', () => {
        expect(driveData.type).toBe('text');
        expect(driveData.content).toBe('Hello, World!');
    });

    it('converts to JSON correctly', () => {
        const expectedJSON = {
            type: 'text',
            content: 'Hello, World!',
        };
        expect(driveData.toJSON()).toEqual(expectedJSON);
    });

    it('converts to uint8Array correctly', () => {
        const array = driveData.toUint8Array();
        expect(array).toBeInstanceOf(Uint8Array);
    });

    it('generates a hash correctly', () => {
        const hash = driveData.toHash();
        expect(hash).toBeDefined();
        expect(hash).toBe('87ffcf81e64343908cc0a5db9961f25295ee994aa8706256e25de7858924f4d6');
    });
    it('converts to hex correctly', () => {
        const hex = driveData.toHex();
        expect(hex).toBeDefined();
        expect(hex).toBe('04746578740d48656c6c6f2c20576f726c6421');
    });
    it('import from hex correctly', () => {
        const parsed = DriveData.fromHex(driveData.toHex());
        expect(parsed).toBeDefined();
        expect(parsed.toHex()).toBe(driveData.toHex());
    });
    it('import from uint8Array correctly', () => {
        const parsed = DriveData.fromUint8Array(driveData.toUint8Array());
        expect(parsed).toBeDefined();
        expect(parsed.toUint8Array()).toEqual(driveData.toUint8Array());
    });

});
