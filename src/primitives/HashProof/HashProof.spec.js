// import { describe, it, expect } from 'vitest';
import { describe, it, expect } from '@scintilla-network/litest';
import HashProof from './HashProof.js';
import { Transaction } from '../Transaction/Transaction.js';
import Asset from '../Asset/Asset.js';

describe('HashProof', () => {
    let hashProof;
    it('should create a hash proof', () => {
        hashProof = new HashProof();
        expect(hashProof).toBeDefined();
    });
    it.only('should create a hash proof with a header and payload', () => {
        hashProof = new HashProof({
            header: {
                version: 1,
                previousHash: null,
                timestamp: 1758829635964n,
                height: 0,
                cluster: 'core.banking',
                proposer: 'alice',
                merkleRoot: null,
                nonce: 0n,
                difficulty: 0n,
            },
        });
        hashProof.consider(new Transaction({
            cluster: 'core.banking',
            action: 'CREATE',
            type: 'ASSET',
            timestamp: 1758829635964n,
            data: [new Asset({
            name: 'test',
            symbol: 'test',
            decimals: 18,
            supply: {
                max: 1000000000000000000n,
                total: 1000000000000000000n,
                circulating: 1000000000000000000n,
            },
        })]}));
        expect(hashProof).toBeDefined();
    });
    it.only('should get a valid hash', () => {
        expect(hashProof.toHash()).toBeDefined();
        expect(hashProof.toHash()).toBe('f91b1cb5964fc05a0f0a7fbd4bfdfa2924e7174c776edc8edfc4b4766bf30233');
    });
    it.only('should get a valid hash from hex', () => {
        expect(hashProof.toHex()).toBe('0701600100ff7c696a829901000000000000000000000000000000000000000000000000000000000000000000000c636f72652e62616e6b696e6705616c696365bff18f3004b10b19e0996030b762228f272adb62817ac6ec1cec8a8d015f85d60000fd21010108010c636f72652e62616e6b696e670643524541544505415353455401d41104746573740474657374fd000064a7b3b6e00dfd000064a7b3b6e00dfd000064a7b3b6e00d12497b22646973747269627574696f6e73223a5b5d2c226d656d62657273223a5b5d2c22726571756972656d656e7473223a5b5d2c2274797065223a2251554f52554d5f50524f4f46227d025b5d2b7b226275726e223a5b227363696e74696c6c61225d2c226d696e74223a5b227363696e74696c6c61225d7d012f5b227472616e73666572222c7b2270657263656e74223a22323030222c226d6178223a223230303030303030227d5d027b7dfd7c696a8299010000001f7b2273746172745469636b223a2230222c22656e645469636b223a2230227d00000000');
    });
    it.only('converts to a Uint8Array correctly', () => {
        const array = hashProof.toUint8Array();
        expect(array).toBeDefined();
        const parsed = HashProof.fromUint8Array(array);
        expect(parsed.toHash()).toBe(hashProof.toHash());
        expect(parsed.toHex()).toBe(hashProof.toHex());
        expect(parsed.toHash()).toBe('f91b1cb5964fc05a0f0a7fbd4bfdfa2924e7174c776edc8edfc4b4766bf30233');
    });
});