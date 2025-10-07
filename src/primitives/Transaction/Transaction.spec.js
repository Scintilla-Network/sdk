// import { describe, it, expect } from 'vitest';
import { describe, it, expect } from '@scintilla-network/litest';
import Transaction from './Transaction.js';
import Asset from '../Asset/Asset.js';

describe('Transaction', () => {
    it('should create a transaction', () => {
        const transaction = new Transaction();
        expect(transaction).toBeDefined();
    });
    it('should toUint8Array', () => {
        const transaction = new Transaction({
            timestamp: 1758829635964n,
            cluster: 'core.banking',
            action: 'CREATE',
            type: 'ASSET',
            data: [new Asset({
                name: 'test',
                symbol: 'test',
                decimals: 18,
            })],
        });

        expect(transaction.data[0].toHex()).toEqual('1104746573740474657374fd00008a5d78456301000012497b22646973747269627574696f6e73223a5b5d2c226d656d62657273223a5b5d2c22726571756972656d656e7473223a5b5d2c2274797065223a2251554f52554d5f50524f4f46227d025b5d2b7b226275726e223a5b227363696e74696c6c61225d2c226d696e74223a5b227363696e74696c6c61225d7d01347b2274797065223a227472616e73666572222c2270657263656e74223a22323030222c226d6178223a223230303030303030227d027b7d');
        const array = transaction.toUint8Array();
        expect(transaction.toHex()).toEqual('08010c636f72652e62616e6b696e67fd7c696a829901000006435245415445054153534554cc1801c91104746573740474657374fd00008a5d78456301000012497b22646973747269627574696f6e73223a5b5d2c226d656d62657273223a5b5d2c22726571756972656d656e7473223a5b5d2c2274797065223a2251554f52554d5f50524f4f46227d025b5d2b7b226275726e223a5b227363696e74696c6c61225d2c226d696e74223a5b227363696e74696c6c61225d7d01347b2274797065223a227472616e73666572222c2270657263656e74223a22323030222c226d6178223a223230303030303030227d027b7d0000031800000000');
        // console.log('array', transaction.toHex());
        // console.log('array', transaction.toHash());

        const parsed = Transaction.fromUint8Array(array);
        expect(parsed.toHex()).toEqual(transaction.toHex());

        expect(parsed.data[0].toHex()).toEqual(transaction.data[0].toHex());
        expect(parsed.data[0].toHash()).toEqual(transaction.data[0].toHash());
        expect(parsed.toHash()).toEqual(transaction.toHash());
        expect(parsed.toHash()).toEqual('5c290ac58fd2b1c19e682326effcc52e5dab8611d367ac60f9e7a77046c002aa');
    });
    // describe('toUint8Array', () => {
    //     it('should have the same uint8Array', () => {

    //         const mintTransaction = new Transaction({
    //             module: 'core.banking',
    //             action: 'MINT',
    //             type: 'ASSET',
    //             data: [{
    //                 asset: 'SCT', // 'SCT'
    //                 amount: 2_000_000n,
    //                 recipient: 'scintilla',
    //             }],
    //             sender: 'scintilla',
    //             timestamp: 1758835630175n,
    //         });
    //         const array = mintTransaction.toUint8Array();
    //         // console.log(array);
    //         // const hash = mintTransaction.toHash();
    //         // expect(hash).toEqual('6291e1d214e9e2e14a247575b6e36768b7e22a6a2202e2f422b98b7e7ab2162e');
    //         // const hex = mintTransaction.toHex();
    //         // expect(hex).toEqual('080100044d494e54054153534554013a7b226173736574223a22534354222c22616d6f756e74223a2232303030303030222c22726563697069656e74223a227363696e74696c6c61227dfd5fe0c58299010000001f7b2273746172745469636b223a2230222c22656e645469636b223a2230227d00');
    //         // const parsed = Transaction.fromUint8Array(array);
    //         // expect(parsed.toHash()).toEqual(mintTransaction.toHash());
    //         // expect(parsed.toHex()).toEqual(mintTransaction.toHex());
    //     });
    // });
});