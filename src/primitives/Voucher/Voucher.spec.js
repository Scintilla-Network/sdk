import { describe, it, expect, beforeEach } from '@scintilla-network/litest';
import Voucher from './Voucher.js';
import { uint8array } from '@scintilla-network/keys/utils';
import { Wallet } from '@scintilla-network/wallet';
import { Authorization } from '../Authorization/Authorization.js';


const persona = Wallet.fromMnemonic('test test test test test test test test test test test junk').getAccount(0).getPersona('alice');

const VOUCHER_FIXTURES = {
    sct: {
        asset: 'sct',
        inputs: [{ amount: 100n, hash: '80339755a52f941e8ce21a1d85a2d774ec75c84e7c13462de0028b9beb781e41' }],
        output: { amount: 2000000000000000000n, recipient: 'alex' },
        timelock: {
            startAt: 0,
            endAt: 0,
        },
        timestamp: 1736302004090n

    },
    sct_as_hex: '037363740164000000000000000000c84e676dc11b04616c6578000000000000000000000000000000007a07aa4394010000'
}

describe('Voucher', () => {
    let voucher;
    let voucherFromJSON;

    beforeEach(() => {
        voucher = new Voucher({
            asset: 'test-asset',
            inputs: [{ amount: 100n, hash: '80339755a52f941e8ce21a1d85a2d774ec75c84e7c13462de0028b9beb781e41' }],
            output: { amount: 100n, recipient: 'test-recipient' },
            timelock: {
                startAt: 0n,
                endAt: 0n,
            },
            timestamp: 1758812935574n
        });
        voucherFromJSON = Voucher.fromJSON(VOUCHER_FIXTURES.sct);
    });
    it('should properly compute hash', async () => {
        expect(voucherFromJSON.toHash('hex')).toEqual('c6d306de5b83b606ecd6ffd110aadf1ced2765b6f88ce232a0fa6058b252a94f');
        expect(voucherFromJSON.hash).toEqual('c6d306de5b83b606ecd6ffd110aadf1ced2765b6f88ce232a0fa6058b252a94f');
        expect(voucher.toHash('hex')).toEqual('b4b766ab289fc2cfa1f486967e507746580c732666fc26f4f07e2c604ace01a7');
        expect(voucher.hash).toEqual('b4b766ab289fc2cfa1f486967e507746580c732666fc26f4f07e2c604ace01a7');
    });
    it('should create a Voucher instance', async () => {
        const voucher = new Voucher({
            asset: 'SCT',
            inputs: [{
                // null hash for creation of voucher (no ref to previous transaction)
                hash: '0000000000000000000000000000000000000000000000000000000000000000',
                // amount: genesisNodeMint.data.amount,
                amount: 1_000n * 10n**9n,
            }],
            output: {
                recipient: 'scintilla',
                // amount: 500_000n * 10n**9n,
                amount: 1_000n * 10n**9n,
            },
            data: [ { description: 'Minted coins for the genesis node', moniker: persona.getMoniker() } ]
          });
          
        //   await voucher.sign(persona.getSigner());
        const bytes = voucher.toUint8Array();
        const hex = voucher.toHex();
        const hash = voucher.toHash('hex');

        const parsedFromBytes = Voucher.fromHex(hex);
        const parsedFromBytesHash = parsedFromBytes.toHash('hex');

        expect(parsedFromBytesHash).toBe(hash);
        expect(parsedFromBytes.toJSON()).toEqual(voucher.toJSON());
    });

    it('should initialize with default values when no arguments provided', () => {
        const emptyVoucher = new Voucher();
        expect(emptyVoucher.asset).toBe('');
        expect(emptyVoucher.inputs).toEqual([]);
        expect(emptyVoucher.output).toEqual({ amount: 0n, recipient: '' });
        expect(emptyVoucher.stack).toEqual([]);
        expect(emptyVoucher.data).toEqual([]);
        expect(emptyVoucher.authorizations).toEqual([]);
    });

    it('should initialize with fixture values', () => {
        const voucherFromJSON = Voucher.fromJSON(VOUCHER_FIXTURES.sct);
        expect(voucherFromJSON.asset).toBe('sct');
        expect(voucherFromJSON.inputs).toEqual([{ amount: 100n, hash: '80339755a52f941e8ce21a1d85a2d774ec75c84e7c13462de0028b9beb781e41' }]);
        expect(voucherFromJSON.output).toEqual({ amount: 2000000000000000000n, recipient: 'alex' });
    });

    it('should to uint8array correctly', () => {
        voucher = new Voucher({
            version: 1,
            asset: 'test-asset',
            inputs: [{ 
                amount: 100n, hash: '3284d6c6228b931f0cb36146a79bd85d5e4bf02d9c3b8219a31285b80305625c',
             }, {
                amount: 200n, hash: '3284d6c6228b931f0cb36146a79bd85d5e4bf02d9c3b8219a31285b80305625c',
             }
            ],
            output: { amount: 100n, recipient: 'test-recipient' },
            stack: [],
            timestamp: 1758812935574n,
            data: [{description:'test-data-1-description-very-long-description-sufficient-for-v1-limit', type:'RAW'}],
            timelock: {
                startAt: 10n,
                endAt: 20n
            },
            authorizations: [{
                signature: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                publicKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
                moniker: 'test-moniker',
                address: 'test-address'
            }]
        });
        const parsedVoucher = Voucher.fromUint8Array(voucher.toUint8Array());
        expect(voucher.toJSON()).toEqual(parsedVoucher.toJSON());
    });

    it('should compute hash correctly', () => {
        const hash = voucher.toHash('hex');
        expect(typeof hash).toBe('string');
        expect(hash.length).toBe(64); // SHA256 hash length in hex
        const uintHash = voucher.toHash('uint8array');
        expect(uintHash).toBeInstanceOf(Uint8Array);
        expect(uintHash.length).toBe(32);
        expect(uint8array.toHex(uintHash)).toBe(hash);
    });

    it('should convert to and from JSON correctly', () => {
        const json = voucher.toJSON();
        expect(json.asset).toBe('test-asset');
        expect(json.inputs[0].amount).toBe('100');
        expect(json.output.amount).toBe('100');
        expect(json.timelock).toBeDefined();
        expect(json.timelock.startTick).toBeDefined();
        expect(json.timelock.endTick).toBeDefined();

        const parsedVoucher = Voucher.fromJSON(json);
        expect(parsedVoucher.toHash('hex')).toBe(voucher.toHash('hex'));
    });

    it('should handle authorization operations correctly', async () => {
        await voucher.sign(persona.getSigner());
        expect(voucher.authorizations.length).toBe(1);
        expect(voucher.authorizations[0].signature).toEqual('b4c7f3d231056481d389118488b4987ac372170710046e723b219380996384a86d7c82717efc55d2ee2d38c6347129936c0a2b150a763b9e9bd773b6ba03f308');
        expect(voucher.authorizations[0].publicKey).toEqual('02579ebe87e5972e6a314f479f868dbec870d42dfda787cebdcbc8b73c15f5e9b7');
        expect(voucher.authorizations[0].moniker).toEqual('alice');
        expect(voucher.authorizations[0].address).toEqual('sct1lte0ch6stjv0wt935886t0mquya7ue0gwx5vyf');
    });

    it('should validate authorization requirements', () => {
        const { valid, error } = voucher.validate();
        expect(valid).toBe(false);
        expect(error).toBe('Authorizations are required.');
    });

    it('should calculate total input correctly', () => {
        const total = voucher.getTotalInput();
        expect(total).toBe(100n);
    });

    it('should calculate total output correctly', () => {
        const total = voucher.getTotalOutput();
        expect(total).toBe(100n);
    });

    it('should validate timelock correctly', () => {
        const now = BigInt(Date.now());
        const voucher = new Voucher({
            asset: 'test-asset',
            inputs: [{ amount: 100n, hash: 'test-hash' }],
            output: { amount: 100n, recipient: 'test-recipient' },
            timelock: {
                startTick: now - 1000n,
                endTick: now + 1000n,
            }
        });

        expect(voucher.isValidAtTime(now)).toBe(true);
        expect(voucher.isValidAtTime(now + 2000n)).toBe(false);
        expect(voucher.isValidAtTime(now - 2000n)).toBe(false);
    });

    it('should handle buffer conversions correctly', () => {
        const buffer = voucher.toUint8Array();
        expect(buffer instanceof Uint8Array).toBe(true);
        expect(buffer.length).toBe(82);
        const parsedVoucher = Voucher.fromUint8Array(buffer);
        expect(parsedVoucher.toHash('hex')).toBe(voucher.toHash('hex'));
    });

    it('should handle base64 conversion', () => {
        const base64 = voucher.toBase64();
        expect(typeof base64).toBe('string');
        expect(base64).toMatch(/^[A-Za-z0-9+/=]+$/);
    });
});

describe('Voucher Transfer Scenarios', () => {
    let initialVoucher;

    beforeEach(() => {
        initialVoucher = new Voucher({
            asset: 'sct',
            inputs: [],
            output: { 
                amount: 2000000000000000000n, // 2 * 10^18
                recipient: 'alex'
            },
            timelock: {
                startAt: BigInt(Date.now()),
                endAt: BigInt(Date.now() + 3600000),
                createdAt: BigInt(Date.now())
            }
        });
    });

    it('should create split vouchers from initial voucher', () => {
        const initialHash = initialVoucher.toHash('hex');
        
        const splitVoucher1 = new Voucher({
            asset: 'sct',
            inputs: [{ amount: 1000000000000000000n, hash: initialHash }],
            output: {
                amount: 1000000000000000000n, // 1 * 10^18
                recipient: 'alex'
            }
        });

        const splitVoucher2 = new Voucher({
            asset: 'sct',
            inputs: [{ amount: 1000000000000000000n, hash: initialHash }],
            output: {
                amount: 1000000000000000000n, // 1 * 10^18
                recipient: 'bob'
            }
        });

        expect(splitVoucher1.inputs[0].hash).toBe(initialHash);
        expect(splitVoucher2.inputs[0].hash).toBe(initialHash);
        expect(splitVoucher1.getTotalInput()).toBe(1000000000000000000n);
        expect(splitVoucher2.getTotalInput()).toBe(1000000000000000000n);
        expect(splitVoucher1.getTotalOutput()).toBe(1000000000000000000n);
        expect(splitVoucher2.getTotalOutput()).toBe(1000000000000000000n);
    });

    it('should merge multiple vouchers into one', () => {
        const voucher1 = new Voucher({
            asset: 'sct',
            inputs: [],
            output: { 
                amount: 1000000000000000000n,
                recipient: 'bob'
            }
        });

        const voucher2 = new Voucher({
            asset: 'sct',
            inputs: [],
            output: { 
                amount: 1000000000000000000n,
                recipient: 'bob'
            }
        });

        const mergedVoucher = new Voucher({
            asset: 'sct',
            inputs: [
                { amount: 1000000000000000000n, hash: voucher1.toHash('hex') },
                { amount: 1000000000000000000n, hash: voucher2.toHash('hex') }
            ],
            output: {
                amount: 2000000000000000000n,
                recipient: 'alice'
            }
        });

        expect(mergedVoucher.inputs.length).toBe(2);
        expect(mergedVoucher.getTotalInput()).toBe(2000000000000000000n);
        expect(mergedVoucher.getTotalOutput()).toBe(2000000000000000000n);
        expect(mergedVoucher.output.recipient).toBe('alice');
    });

    it('should validate input hashes match referenced vouchers', () => {
        const sourceVoucher = new Voucher({
            asset: 'sct',
            inputs: [],
            output: { 
                amount: 1000000000000000000n,
                recipient: 'alex'
            }
        });

        const transferVoucher = new Voucher({
            asset: 'sct',
            inputs: [{ 
                amount: 1000000000000000000n, 
                hash: sourceVoucher.toHash('hex') 
            }],
            output: {
                amount: 1000000000000000000n,
                recipient: 'bob'
            }
        });

        expect(transferVoucher.inputs[0].hash).toBe(sourceVoucher.toHash('hex'));
        expect(transferVoucher.asset).toBe(sourceVoucher.asset);
        expect(transferVoucher.getTotalInput()).toBe(sourceVoucher.getTotalOutput());
    });

    it('should handle complex transfer chain', () => {
        // Initial voucher (2 SCT to Alex)
        const initialHash = initialVoucher.toHash('hex');

        // Split to Alex and Bob (1 SCT each)
        const splitVouchers = [
            new Voucher({
                asset: 'sct',
                inputs: [{ amount: 1000000000000000000n, hash: initialHash }],
                output: { amount: 1000000000000000000n, recipient: 'alex' }
            }),
            new Voucher({
                asset: 'sct',
                inputs: [{ amount: 1000000000000000000n, hash: initialHash }],
                output: { amount: 1000000000000000000n, recipient: 'bob' }
            })
        ];

        // Merge back to Alice (2 SCT)
        const mergedVoucher = new Voucher({
            asset: 'sct',
            inputs: [
                { amount: 1000000000000000000n, hash: splitVouchers[0].toHash('hex') },
                { amount: 1000000000000000000n, hash: splitVouchers[1].toHash('hex') }
            ],
            output: { amount: 2000000000000000000n, recipient: 'alice' }
        });

        expect(mergedVoucher.getTotalInput()).toBe(initialVoucher.getTotalOutput());
        expect(splitVouchers[0].getTotalOutput() + splitVouchers[1].getTotalOutput())
            .toBe(initialVoucher.getTotalOutput());
    });
});