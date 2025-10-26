import { describe, it, expect } from '@scintilla-network/litest';
import { Transaction } from './Transaction.js';
import { Wallet } from '@scintilla-network/wallet';
import { Asset } from '../Asset/Asset.js';

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
        expect(transaction.toHex('hex')).toEqual('08010c636f72652e62616e6b696e67fd7c696a829901000006435245415445054153534554cc1801c91104746573740474657374fd00008a5d78456301000012497b22646973747269627574696f6e73223a5b5d2c226d656d62657273223a5b5d2c22726571756972656d656e7473223a5b5d2c2274797065223a2251554f52554d5f50524f4f46227d025b5d2b7b226275726e223a5b227363696e74696c6c61225d2c226d696e74223a5b227363696e74696c6c61225d7d01347b2274797065223a227472616e73666572222c2270657263656e74223a22323030222c226d6178223a223230303030303030227d027b7d0000031800000000');

        const parsed = Transaction.fromUint8Array(array);
        expect(parsed.toHex()).toEqual(transaction.toHex());

        expect(parsed.data[0].toHex()).toEqual(transaction.data[0].toHex());
        expect(parsed.data[0].toHash('hex')).toEqual(transaction.data[0].toHash('hex'));
        expect(parsed.toHash('hex')).toEqual(transaction.toHash('hex'));
        expect(parsed.toHash('hex')).toEqual('5c290ac58fd2b1c19e682326effcc52e5dab8611d367ac60f9e7a77046c002aa');
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


describe('Transaction', () => {
    it('initializes with default values if no arguments are provided', () => {
        const transaction = new Transaction();
        expect(transaction.kind).toBe('TRANSACTION');
        expect(transaction.version).toBe(1);
        expect(transaction.cluster).toBeNull();
        expect(transaction.action).toBeNull();
        expect(transaction.type).toBeNull();
        expect(transaction.data).toEqual([]);
        expect(Number(transaction.timestamp)).toBeLessThanOrEqual(Date.now());
        expect(transaction.timelock).toEqual({ startTick: 0n, endTick: 0n });
        expect(transaction.authorizations).toEqual([]);
        expect(transaction.fees).toEqual([]);
    });

    it('initializes with custom values', () => {
        const customTransaction = new Transaction({
            cluster: 'core.banking',
            action: 'CREATE',
            type: 'ASSET',
            data: [{ amount: 1000, currency: 'USD' }],
            timestamp: 1625097600000,
            timelock: { startTick: 100n, endTick: 200n },
            authorizations: [
                {
                    publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                    signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                }
            ],
            fees: [
                {
                    asset: 'SCT',
                    amount: 1000,
                    payer: 'alice'
                }
            ]
        });

        expect(customTransaction.cluster).toBe('core.banking');
        expect(customTransaction.action).toBe('CREATE');
        expect(customTransaction.type).toBe('ASSET');
        expect(customTransaction.data).toEqual([{ amount: 1000, currency: 'USD' }]);
        expect(Number(customTransaction.timestamp)).toBe(1625097600000);
        expect(customTransaction.timelock).toEqual({ startTick: 100n, endTick: 200n });
        expect(customTransaction.authorizations).toEqual([
            {
                signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                moniker: null,
                address: null,
            }
        ]);
        expect(customTransaction.fees).toEqual([
            {
                asset: 'SCT',
                amount: 1000,
                payer: 'alice'
            }
        ]);
    });

    it('toJSON method returns the correct object', () => {
        const transaction = new Transaction({
            cluster: 'core.banking',
            action: 'CREATE',
            type: 'ASSET',
            data: [{ amount: 1000, currency: 'USD' }],
            timestamp: 1625097600000,
            timelock: { startTick: 100n, endTick: 200n },
            authorizations: [
                {
                    publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                    signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                }
            ],
            fees: [
                {
                    asset: 'SCT',
                    amount: 1000,
                    payer: 'alice'
                }
            ]
        });

        const expectedJSON = {
            kind: 'TRANSACTION',
            version: 1,
            cluster: 'core.banking',
            timestamp: 1625097600000n,
            action: 'CREATE',
            type: 'ASSET',
            data: [{ amount: 1000, currency: 'USD' }],
            timelock: { startTick: 100n, endTick: 200n },
            fees: [
                {
                    asset: 'SCT',
                    amount: 1000,
                    payer: 'alice',
                }
            ],
            authorizations: [
                {
                    signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                    publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                    moniker: null,
                    address: null,
                }
            ]
        };

        expect(transaction.toJSON()).toEqual(expectedJSON);
    });

    it('toJSON with excludeAuthorizations option', () => {
        const transaction = new Transaction({
            cluster: 'core.banking',
            action: 'CREATE',
            type: 'ASSET',
            timestamp: 1625097600000,
            authorizations: [
                {
                    publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                    signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                }
            ],
        });

        const json = transaction.toJSON({ excludeAuthorizations: true });
        expect(json.authorizations).toBeUndefined();
    });

    it('toHash method returns the correct hash', () => {
        const transaction = new Transaction({
            cluster: 'core.banking',
            action: 'CREATE',
            type: 'ASSET',
            data: [{ amount: 1000, currency: 'USD' }],
            timestamp: 1625097600000,
        });

        const hash = transaction.toHash('hex');
        expect(hash).toBeDefined();
        expect(typeof hash).toBe('string');
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('toUint8Array method returns the correct Uint8Array', () => {
        const transaction = new Transaction({
            cluster: 'core.banking',
            action: 'CREATE',
            type: 'ASSET',
            data: [{ amount: 1000, currency: 'USD' }],
            timestamp: 1625097600000,
        });

        const uint8Array = transaction.toUint8Array();
        expect(uint8Array).toBeInstanceOf(Uint8Array);
        expect(uint8Array.length).toBeGreaterThan(0);
    });

    it('toHex method returns the correct hex string', () => {
        const transaction = new Transaction({
            cluster: 'core.banking',
            action: 'CREATE',
            type: 'ASSET',
            data: [{ amount: 1000, currency: 'USD' }],
            timestamp: 1625097600000,
        });

        const hexString = transaction.toHex();
        expect(typeof hexString).toBe('string');
        expect(hexString).toMatch(/^[0-9a-f]+$/);
    });

    it('addAuthorization method adds a new authorization', () => {
        const transaction = new Transaction({
            timestamp: 1720130703556
        });
        const authorization = { 
            publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101', 
            signature: 'c5933fc1eec18a29888cb5054bb126578048c5bf732127b23ede48ee0ef8d5dc544f43b36c14038b0d4e1854fea7413ad7ecd2fde4868450f204e3a629b0dda1' 
        };

        transaction.addAuthorization(authorization);
        expect(transaction.authorizations.length).toBe(1);
        expect(transaction.authorizations[0].signature).toBe(authorization.signature);
    });

    it('addAuthorization throws error if signature is missing', () => {
        const transaction = new Transaction({
            timestamp: 1720130703556
        });
        const authorization = { 
            publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101'
        };

        expect(() => transaction.addAuthorization(authorization)).toThrow('Signature is required for authorization.');
    });

    it('setTimelock method updates timelock', () => {
        const transaction = new Transaction({
            timestamp: 1720130703556
        });

        transaction.setTimelock(100n, 200n);
        expect(transaction.timelock).toEqual({ startTick: 100n, endTick: 200n });
    });

    it('isValidAtTick returns true when within timelock range', () => {
        const transaction = new Transaction({
            timestamp: 1720130703556,
            timelock: { startTick: 100n, endTick: 200n }
        });

        expect(transaction.isValidAtTick(150n)).toBe(true);
        expect(transaction.isValidAtTick(100n)).toBe(true);
        expect(transaction.isValidAtTick(200n)).toBe(true);
    });

    it('isValidAtTick returns false when outside timelock range', () => {
        const transaction = new Transaction({
            timestamp: 1720130703556,
            timelock: { startTick: 100n, endTick: 200n }
        });

        expect(transaction.isValidAtTick(99n)).toBe(false);
        expect(transaction.isValidAtTick(201n)).toBe(false);
    });

    it('isValidAtTick returns true when no timelock is set', () => {
        const transaction = new Transaction({
            timestamp: 1720130703556
        });

        expect(transaction.isValidAtTick(0n)).toBe(true);
        expect(transaction.isValidAtTick(999999n)).toBe(true);
    });

    describe('isValidAtTick', () => {
        it('isValidAtTick method returns true for valid transaction', () => {
            const now = BigInt(Date.now());
            const transaction = new Transaction({
                timelock: {
                    startTick: now - 1000n,
                    endTick: now + 1000n,
                }
            });
            expect(transaction.isValidAtTick(now)).toBe(true);
            expect(transaction.isValidAtTick(now + 2000n)).toBe(false);
            expect(transaction.isValidAtTick(now - 2000n)).toBe(false);
    
            const transaction2 = new Transaction();
            expect(transaction2.isValidAtTick(0n)).toBe(true);
            expect(transaction2.isValidAtTick(999999n)).toBe(true);
            expect(transaction2.isValidAtTick(now)).toBe(true);
            expect(transaction2.isValidAtTick(now + 2000n)).toBe(true);
            expect(transaction2.isValidAtTick(now - 2000n)).toBe(true);
          
        });
    });

    describe('sign and verify', () => {
        it('signs transaction with wallet signer', async () => {
            const transaction = new Transaction({
                timestamp: 1720130703556,
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
            });

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await transaction.sign(signer);

            expect(transaction.authorizations.length).toBe(1);
            expect(transaction.authorizations[0].signature).toBeDefined();
            expect(transaction.authorizations[0].publicKey).toBeDefined();
        });

        it('verifies valid signature', async () => {
            const transaction = new Transaction({
                timestamp: 1720130703556,
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
            });

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await transaction.sign(signer);

            const isValid = transaction.verifyAuthorizations();
            expect(isValid).toBe(true);
        });

        it('replaces existing authorization when signing with same moniker', async () => {
            const transaction = new Transaction({
                timestamp: 1720130703556,
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
            });

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await transaction.sign(signer);
            const firstSignature = transaction.authorizations[0].signature;

            await transaction.sign(signer);
            const secondSignature = transaction.authorizations[0].signature;

            expect(transaction.authorizations.length).toBe(1);
            expect(firstSignature).toBe(secondSignature);
        });
    });

    describe('validate', () => {
        it('returns valid for properly signed transaction', async () => {
            const transaction = new Transaction({
                timestamp: 1720130703556,
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
            });

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await transaction.sign(signer);

            const validation = transaction.validate();
            expect(validation).toEqual({ valid: true, error: '' });
        });

        it('returns invalid when no authorizations', () => {
            const transaction = new Transaction({
                timestamp: 1720130703556
            });

            transaction.authorizations = null;
            const validation = transaction.validate();
            expect(validation.valid).toBe(false);
            expect(validation.error).toBe('Authorizations are required.');
        });

        it('returns invalid when no signed authorizations', () => {
            const transaction = new Transaction({
                timestamp: 1720130703556
            });

            const validation = transaction.validate();
            expect(validation.valid).toBe(false);
            expect(validation.error).toBe('At least one authorization with signature is required.');
        });
    });

    describe('isValid', () => {
        it('returns true for valid transaction', async () => {
            const transaction = new Transaction({
                timestamp: 1720130703556,
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
            });

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await transaction.sign(signer);

            expect(transaction.isValid()).toBe(true);
        });

        it('returns false for invalid transaction', () => {
            const transaction = new Transaction({
                timestamp: 1720130703556
            });

            expect(transaction.isValid()).toBe(false);
        });
    });

    describe('serialization and deserialization', () => {
        it('should serialize and deserialize maintaining consistency', async () => {
            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758835630175n,
                data: [{ amount: 1000, currency: 'USD' }],
            });

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await transaction.sign(signer);

            const uint8Array = transaction.toUint8Array();
            expect(uint8Array).toEqual(transaction.toUint8Array());

            const hash = transaction.toHash('hex');
            const parsed = Transaction.fromUint8Array(uint8Array);

            expect(parsed.toHash('hex')).toBe(hash);
            expect(parsed.isValid()).toBe(true);
            expect(parsed.verifyAuthorizations()).toBe(true);

            const validation = parsed.validate();
            expect(validation.valid).toBe(true);
            expect(validation.error).toBe('');
        });

        it('should deserialize from hex', () => {
            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758835630175n,
            });

            const hexString = transaction.toHex();
            const parsed = Transaction.fromHex(hexString);

            expect(parsed.toHash('hex')).toBe(transaction.toHash('hex'));
            expect(parsed.cluster).toBe(transaction.cluster);
            expect(parsed.action).toBe(transaction.action);
            expect(parsed.type).toBe(transaction.type);
        });

        it('should handle Asset data in serialization', () => {
            const asset = new Asset({
                name: 'Test Asset',
                symbol: 'TEST',
                decimals: 18,
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758835630175n,
                data: [asset.toJSON()],
            });

            const uint8Array = transaction.toUint8Array();
            const parsed = Transaction.fromUint8Array(uint8Array);

            expect(parsed.toHash('hex')).toBe(transaction.toHash('hex'));
            expect(parsed.data[0].toJSON()).toEqual(asset.toJSON());
        });

        it('should serialize with excludeAuthorizations option', async () => {
            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758835630175n,
            });

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await transaction.sign(signer);

            const withAuth = transaction.toUint8Array({ excludeAuthorizations: false });
            const withoutAuth = transaction.toUint8Array({ excludeAuthorizations: true });

            expect(withAuth.length).toBeGreaterThan(withoutAuth.length);
        });
    });

    describe('toBase64', () => {
        it('should convert transaction to base64', () => {
            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758835630175n,
            });

            const base64 = transaction.toBase64();
            expect(typeof base64).toBe('string');
            expect(base64.length).toBeGreaterThan(0);
        });
    });

    describe('fromJSON', () => {
        it('should create transaction from JSON', () => {
            const json = {
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758835630175n,
                data: [{ amount: 1000, currency: 'USD' }],
            };

            const transaction = Transaction.fromJSON(json);

            expect(transaction.cluster).toBe(json.cluster);
            expect(transaction.action).toBe(json.action);
            expect(transaction.type).toBe(json.type);
            expect(transaction.timestamp).toBe(json.timestamp);
            expect(transaction.data).toEqual(json.data);
        });
    });

    describe('multisig scenario', () => {
        it('should handle multiple authorizations', async () => {
            const transaction = new Transaction({
                timestamp: 1758835630175n,
                cluster: 'core.banking',
                action: 'EXECUTE',
                type: 'ASSET',
                data: [{
                    asset: 'SCT',
                    amount: 300000 * 10 ** 8,
                    recipient: 'tech-dao',
                }],
                fees: [{
                    amount: 1000,
                    asset: 'SCT',
                    payer: 'alice',
                }],
            });

            const wallet = Wallet.fromMnemonic('test test test test test test test test test test test junk');
            const aliceSigner = wallet.getAccount(0).getPersona('alice').getSigner();
            const bobSigner = wallet.getAccount(1).getPersona('bob').getSigner();

            await transaction.sign(aliceSigner);
            await transaction.sign(bobSigner);

            expect(transaction.authorizations.length).toBe(2);
            expect(transaction.verifyAuthorizations()).toBe(true);
            expect(transaction.isValid()).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle empty data array', () => {
            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758835630175n,
                data: [],
            });

            const uint8Array = transaction.toUint8Array();
            const parsed = Transaction.fromUint8Array(uint8Array);

            expect(parsed.data).toEqual([]);
        });

        it('should handle null cluster', () => {
            const transaction = new Transaction({
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758835630175n,
            });

            const uint8Array = transaction.toUint8Array();
            const parsed = Transaction.fromUint8Array(uint8Array);

            expect(parsed.cluster).toBe(null);

            expect(parsed.toHash('hex')).toBe(transaction.toHash('hex'));
            expect(parsed.isValid()).toBe(false);
            expect(parsed.verifyAuthorizations()).toBe(true);
            expect(parsed.validate().valid).toBe(false);
            expect(parsed.validate().error).toBe('At least one authorization with signature is required.');
        });

        it('should handle default timelock', () => {
            const transaction = new Transaction({
                timestamp: 1758835630175n,
            });

            expect(transaction.timelock).toEqual({ startTick: 0n, endTick: 0n });
        });
    });
});