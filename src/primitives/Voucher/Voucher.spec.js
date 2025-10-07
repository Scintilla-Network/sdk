// import { describe, it, expect, beforeEach } from 'vitest';
import { describe, it, expect, beforeEach } from '@scintilla-network/litest';
import Voucher from './Voucher.js';
import { Wallet } from '@scintilla-network/wallet';
import { Authorization } from '../Authorization/Authorization.js';


const persona = Wallet.create().getAccount(0).getPersona('alice');



describe('Voucher', () => {
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
        const parsedFromBytes = Voucher.fromUint8Array(bytes);
        // console.log({parsedFromBytes});
        
        // const hex = voucher.toHex();
        // console.log({hex});
        // const parsedFromHex = Voucher.fromHex(hex);
        // console.log({parsedFromHex});

        // const json = voucher.toJSON();
        // console.log({json});
        // const parsedFromJson = Voucher.fromJSON(json);
        // console.log({parsedFromJson});

        // const hash = voucher.toHash();
        // expect(hash).toBe(parsedFromBytes.toHash());
        // expect(hash).toBe(parsedFromHex.toHash());
        // expect(hash).toBe(parsedFromJson.toHash());

        //   expect(genesisNodeCreateVoucher.authorizations.length).toBe(1);
        //   expect(genesisNodeCreateVoucher.authorizations[0]).toBeInstanceOf(Authorization);
        //   expect(genesisNodeCreateVoucher.authorizations[0].signature).toBeDefined();
        //   expect(genesisNodeCreateVoucher.authorizations[0].publicKey).toBeDefined();
        //   expect(genesisNodeCreateVoucher.authorizations[0].moniker).toBe(persona.getMoniker());
        //   expect(genesisNodeCreateVoucher.authorizations[0].address).toBe(persona.getSigner().toAddress());

        //   const hex = genesisNodeCreateVoucher.toHex();
        //   const array = genesisNodeCreateVoucher.toUint8Array();
        //   const hash = genesisNodeCreateVoucher.toHash();
        //   const json = genesisNodeCreateVoucher.toJSON();

        //   const parsedFromJson = Voucher.fromJSON(json);
        //   const parsedFromHex = Voucher.fromHex(hex);
        //   const parsedFromArray = Voucher.fromUint8Array(array);

        //   expect(parsedFromJson.toJSON()).toEqual(genesisNodeCreateVoucher.toJSON());
        //   expect(parsedFromHex.toJSON()).toEqual(genesisNodeCreateVoucher.toJSON());
        //   expect(parsedFromArray.toJSON()).toEqual(genesisNodeCreateVoucher.toJSON());


    });
});





const VOUCHER_FIXTURES = {
    sct: {
        asset: 'sct',
        inputs: [{ amount: 100n, hash: '1234567890' }],
        output: { amount: 2000000000000000000n, recipient: 'alex' },
        timelock: {
            startAt: 0,
            endAt: 0,
        },
        timestamp: 1736302004090n

    },
    sct_as_hex: '037363740164000000000000000000c84e676dc11b04616c6578000000000000000000000000000000007a07aa4394010000'
}

describe.skip('Voucher', () => {
    let voucher;
    let voucherFromJSON;

    beforeEach(() => {
        voucher = new Voucher({
            asset: 'test-asset',
            inputs: [{ amount: 100n, hash: 'test-hash' }],
            output: { amount: 100n, recipient: 'test-recipient' },
            timelock: {
                startAt: 0n,
                endAt: 0n,
            },
            timestamp: 1758812935574n
        });
        voucherFromJSON = Voucher.fromJSON(VOUCHER_FIXTURES.sct);
        expect(voucherFromJSON.toHash()).toBe('a3cacd97f5f6a4aafa3fd1629e5b246f1982bab04119716152a354b64b279572');
        expect(voucher.toHash()).toEqual('32777fdc2332149612c905ed47e5b4f38066b2595f4cb74fff431bcb4c2e2cf7');
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
        expect(voucherFromJSON.inputs).toEqual([{ amount: 100n, hash: '1234567890' }]);
        expect(voucherFromJSON.output).toEqual({ amount: 2000000000000000000n, recipient: 'alex' });
    });

    it('should to uint8array correctly', () => {
        // console.log(new 
        // );

        // console.log(uint8array.toHex(sha256('test-asset')));
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
        const hash = voucher.computeHash();
        expect(typeof hash).toBe('string');
        expect(hash.length).toBe(64); // SHA256 hash length in hex
    });

    // it('should convert to and from JSON correctly', () => {
    //     const json = voucher.toJSON();
    //     expect(json.asset).toBe('test-asset');
    //     expect(json.inputs[0].amount).toBe('100');
    //     expect(json.output.amount).toBe('100');
    //     expect(json.timelock).toBeDefined();
    //     expect(json.timelock.startAt).toBeDefined();
    //     expect(json.timelock.endAt).toBeDefined();
    //     expect(json.timelock.createdAt).toBeDefined();
    // });

    // it('should handle authorization operations correctly', async () => {
    //     const mockSigner = {
    //         async signMessageWithSecp256k1(message) {
    //             console.log('signing message', message);
    //             return ['mock-signature', 'mock-public-key'];
    //         },
    //         getMoniker() {
    //             return 'mock-moniker';
    //         },
    //         toAddress() {
    //             return 'mock-address';
    //         }
    //     };

    //     await voucher.sign(mockSigner);
    //     expect(voucher.authorizations.length).toBe(1);
    //     expect(voucher.authorizations[0].signature).toBe('mock-signature');
    //     expect(voucher.authorizations[0].publicKey).toBe('mock-public-key');
    //     expect(voucher.authorizations[0].moniker).toBe('mock-moniker');
    // });

    // it('should validate authorization requirements', () => {
    //     const { valid, error } = voucher.validate();
    //     expect(valid).toBe(false);
    //     expect(error).toBe('Authorizations are required.');
    // });

    // it('should calculate total input correctly', () => {
    //     const total = voucher.getTotalInput();
    //     expect(total).toBe(100n);
    // });

    // it('should calculate total output correctly', () => {
    //     const total = voucher.getTotalOutput();
    //     expect(total).toBe(100n);
    // });

    // it('should validate timelock correctly', () => {
    //     const now = BigInt(Date.now());
    //     const voucher = new Voucher({
    //         asset: 'test-asset',
    //         inputs: [{ amount: 100n, hash: 'test-hash' }],
    //         output: { amount: 100n, recipient: 'test-recipient' },
    //         timelock: {
    //             startAt: now - 1000n,
    //             endAt: now + 1000n,
    //             createdAt: now
    //         }
    //     });

    //     expect(voucher.isValidAtTime(now)).toBe(true);
    //     expect(voucher.isValidAtTime(now + 2000n)).toBe(false);
    //     expect(voucher.isValidAtTime(now - 2000n)).toBe(false);
    // });

    // it('should handle buffer conversions correctly', () => {
    //     const buffer = voucher.toBuffer();
    //     expect(Buffer.isBuffer(buffer)).toBe(true);
        
    //     const hex = voucher.toHex();
    //     expect(typeof hex).toBe('string');
        
    //     const uint8Array = voucher.toUint8Array();
    //     expect(uint8Array instanceof Uint8Array).toBe(true);
    // });

    // it('should handle base64 conversion', () => {
    //     const base64 = voucher.toBase64();
    //     expect(typeof base64).toBe('string');
    //     expect(base64).toMatch(/^[A-Za-z0-9+/=]+$/);
    // });
});

// describe.skip('Voucher Transfer Scenarios', () => {
//     let initialVoucher;

//     beforeEach(() => {
//         initialVoucher = new Voucher({
//             asset: 'sct',
//             inputs: [],
//             output: { 
//                 amount: 2000000000000000000n, // 2 * 10^18
//                 recipient: 'alex'
//             },
//             timelock: {
//                 startAt: BigInt(Date.now()),
//                 endAt: BigInt(Date.now() + 3600000),
//                 createdAt: BigInt(Date.now())
//             }
//         });
//     });

//     it('should create split vouchers from initial voucher', () => {
//         const initialHash = initialVoucher.computeHash();
        
//         const splitVoucher1 = new Voucher({
//             asset: 'sct',
//             inputs: [{ amount: 1000000000000000000n, hash: initialHash }],
//             output: {
//                 amount: 1000000000000000000n, // 1 * 10^18
//                 recipient: 'alex'
//             }
//         });

//         const splitVoucher2 = new Voucher({
//             asset: 'sct',
//             inputs: [{ amount: 1000000000000000000n, hash: initialHash }],
//             output: {
//                 amount: 1000000000000000000n, // 1 * 10^18
//                 recipient: 'bob'
//             }
//         });

//         expect(splitVoucher1.inputs[0].hash).toBe(initialHash);
//         expect(splitVoucher2.inputs[0].hash).toBe(initialHash);
//         expect(splitVoucher1.getTotalInput()).toBe(1000000000000000000n);
//         expect(splitVoucher2.getTotalInput()).toBe(1000000000000000000n);
//         expect(splitVoucher1.getTotalOutput()).toBe(1000000000000000000n);
//         expect(splitVoucher2.getTotalOutput()).toBe(1000000000000000000n);
//     });

//     it('should merge multiple vouchers into one', () => {
//         const voucher1 = new Voucher({
//             asset: 'sct',
//             inputs: [],
//             output: { 
//                 amount: 1000000000000000000n,
//                 recipient: 'bob'
//             }
//         });

//         const voucher2 = new Voucher({
//             asset: 'sct',
//             inputs: [],
//             output: { 
//                 amount: 1000000000000000000n,
//                 recipient: 'bob'
//             }
//         });

//         const mergedVoucher = new Voucher({
//             asset: 'sct',
//             inputs: [
//                 { amount: 1000000000000000000n, hash: voucher1.computeHash() },
//                 { amount: 1000000000000000000n, hash: voucher2.computeHash() }
//             ],
//             output: {
//                 amount: 2000000000000000000n,
//                 recipient: 'alice'
//             }
//         });

//         expect(mergedVoucher.inputs.length).toBe(2);
//         expect(mergedVoucher.getTotalInput()).toBe(2000000000000000000n);
//         expect(mergedVoucher.getTotalOutput()).toBe(2000000000000000000n);
//         expect(mergedVoucher.output.recipient).toBe('alice');
//     });

//     it('should validate input hashes match referenced vouchers', () => {
//         const sourceVoucher = new Voucher({
//             asset: 'sct',
//             inputs: [],
//             output: { 
//                 amount: 1000000000000000000n,
//                 recipient: 'alex'
//             }
//         });

//         const transferVoucher = new Voucher({
//             asset: 'sct',
//             inputs: [{ 
//                 amount: 1000000000000000000n, 
//                 hash: sourceVoucher.computeHash() 
//             }],
//             output: {
//                 amount: 1000000000000000000n,
//                 recipient: 'bob'
//             }
//         });

//         expect(transferVoucher.inputs[0].hash).toBe(sourceVoucher.computeHash());
//         expect(transferVoucher.asset).toBe(sourceVoucher.asset);
//         expect(transferVoucher.getTotalInput()).toBe(sourceVoucher.getTotalOutput());
//     });

//     it('should handle complex transfer chain', () => {
//         // Initial voucher (2 SCT to Alex)
//         const initialHash = initialVoucher.computeHash();

//         // Split to Alex and Bob (1 SCT each)
//         const splitVouchers = [
//             new Voucher({
//                 asset: 'sct',
//                 inputs: [{ amount: 1000000000000000000n, hash: initialHash }],
//                 output: { amount: 1000000000000000000n, recipient: 'alex' }
//             }),
//             new Voucher({
//                 asset: 'sct',
//                 inputs: [{ amount: 1000000000000000000n, hash: initialHash }],
//                 output: { amount: 1000000000000000000n, recipient: 'bob' }
//             })
//         ];

//         // Merge back to Alice (2 SCT)
//         const mergedVoucher = new Voucher({
//             asset: 'sct',
//             inputs: [
//                 { amount: 1000000000000000000n, hash: splitVouchers[0].computeHash() },
//                 { amount: 1000000000000000000n, hash: splitVouchers[1].computeHash() }
//             ],
//             output: { amount: 2000000000000000000n, recipient: 'alice' }
//         });

//         expect(mergedVoucher.getTotalInput()).toBe(initialVoucher.getTotalOutput());
//         expect(splitVouchers[0].getTotalOutput() + splitVouchers[1].getTotalOutput())
//             .toBe(initialVoucher.getTotalOutput());
//     });
// });