import { describe, it, expect } from '@scintilla-network/litest';
import Instruction from './Instruction.js';
import { uint8array, json } from '@scintilla-network/keys/utils';

describe('Instruction', () => {
    // it('should create an Instruction instance', () => {
    //     const instruction = new Instruction();
    //     expect(instruction).toBeDefined();
    // });

    // it('should have a kind property', () => {
    //     const instruction = new Instruction();
    //     expect(instruction.kind).toBe('INSTRUCTION');
    // });

    it('should have a toUint8Array method', () => {
        const instruction = new Instruction({
            kind: 'INSTRUCTION',
            data: {
                    asset: 'SCT',
                    // amount: 500_000n * 10n**9n, // 500_000 SCT (= 500 relayer nodes possible at starts)
                    amount: 4444n * 10n**9n, // 500_000 SCT (= 500 relayer nodes possible at starts)
                    recipient: 'scintilla',
                    version: 1
            }
        });
        // console.log(instruction);
        const array = instruction.toUint8Array();
        console.log(instruction);
        // console.log(instruction.toUint8Array());
        const parsed = Instruction.fromUint8Array(array);
        console.log(parsed);
        // console.log(Instruction.fromUint8Array(instruction.toUint8Array()));


        const hash = instruction.toHash();
        const parsedHash = parsed.toHash();
        expect(hash).toEqual(parsedHash);
    });


});