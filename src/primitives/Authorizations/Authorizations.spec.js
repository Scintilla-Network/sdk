// // import { describe, it, expect } from 'vitest';
import { describe, it, expect } from '@scintilla-network/litest';
import { Authorizations } from './Authorizations.js';
import { Asset } from '../Asset/Asset.js';
// import { utils } from '@scintilla-network/keys';
// const { uint8array } = utils;

import { Authorization } from '../Authorization/Authorization.js';
import { Signer } from '@scintilla-network/keys';
import { uint8array } from '@scintilla-network/keys/utils';

import { Transaction } from '../Transaction/Transaction.js';
import { Transfer } from '../Transfer/Transfer.js';
import { Transition } from '../Transition/Transition.js';
import { Voucher } from '../Voucher/Voucher.js';
import StateActionData from '../StateActionData/StateActionData.js';
// import { ClusterBlock } from '../ClusterBlock/ClusterBlock.js';
import {HashProof} from '../HashProof/HashProof.js';

describe('Authorizations', () => {
    it('should create a Authorizations instance', async () => {

        // const element = new Asset({ 
            // name: 'CustomAsset',
            // symbol: 'CAT',
        // });
        const signer = new Signer(uint8array.fromHex('337adff26342dfbf2bf140532ebd1c77fcd5a23a520a07a83fb78969821070b3'), 'test_moniker');
        
        // const transfer = new Transition();
        // await transfer.sign(signer);
        // console.log(transfer.authorizations.authorizations);


        const element = new Transition();
        // const element = new Authorizations();
        await element.sign(signer);
        // console.log(element);
        console.log(`\n====================== TO UINT8ARRAY ======================`);
        const array = element.toUint8Array();
        console.log(`\n====================== FROM UINT8ARRAY ======================`);
        // console.log(Transfer.fromUint8Array(array));
        // console.log(array);
        const parsed = Transition.fromUint8Array(array);
        // console.log(`====================== FROM UINT8ARRAY ======================`);
        // console.log(parsed.authorizations.authorizations);

        console.log(element.toHash());
        console.log(parsed.toHash());
        // const hasMoniker = !!parsed.authorizations.find(authorization => authorization.moniker === 'test_moniker');
        // const hashesMatch = parsed.authorizations.toHash() === element.authorizations.toHash();
        // console.log({hasMoniker});
        // console.log({hashesMatch});
        // const parsed = Transition.fromHex(transfer.toHex());

        // console.log(parsed.authorizations.authorizations);

        // const parsed = Transaction.fromUint8Array(transfer.toUint8Array());
        // console.log(parsed.authorizations.authorizations);
        // console.log(parsed.authorizations.verify(parsed));
        // const authorizations = new Authorizations();
        // await authorizations.sign(element, signer);
        // console.log(authorizations);
        // const valid = authorizations.verify(element);
        // console.log({valid});

        // const parsed = Authorizations.fromUint8Array(authorizations.toUint8Array());
        // console.log(authorizations.toHash());
        // console.log(parsed.toHash());
        // const relayBlock = new RelayBlock();
        // relayBlock.sign(signer);
        // const parsed = RelayBlock.fromHex(relayBlock.toHex());
        // console.log(parsed.authorizations);
        // console.log(relayBlock.authorizations);
        // console.log(relayBlock.toHash());
        // console.log(parsed.toHash());
        // console.log(relayBlock.authorizations.verify(relayBlock));
    });
});

// describe('Authorization', () => {
//     // Test data
//     const testSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
//     const testPublicKey = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789ab';
//     const testMoniker = 'test_moniker';
//     const testAddress = 'scintilla1abc123def456';

//     describe('Constructor', () => {
//         it('should create empty authorization with no parameters', () => {
//             const auth = new Authorization();
//             expect(auth.signature).toBeNull();
//             expect(auth.publicKey).toBeNull();
//             expect(auth.moniker).toBeNull();
//             expect(auth.address).toBeNull();
//         });

//         it('should create authorization with all parameters', () => {
//             const auth = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });
            
//             expect(auth.signature).toBeInstanceOf(Uint8Array);
//             expect(auth.publicKey).toBeInstanceOf(Uint8Array);
//             expect(auth.moniker).toBe(testMoniker);
//             expect(auth.address).toBe(testAddress);
//         });

//         it('should handle string signature conversion', () => {
//             const auth = new Authorization({ signature: testSignature });
//             expect(auth.signature).toBeInstanceOf(Uint8Array);
//             expect(uint8array.toHex(auth.signature)).toBe(testSignature);
//         });

//         it('should handle Uint8Array signature input', () => {
//             const signatureBytes = uint8array.fromHex(testSignature);
//             const auth = new Authorization({ signature: signatureBytes });
//             expect(auth.signature).toBeInstanceOf(Uint8Array);
//             expect(uint8array.toHex(auth.signature)).toBe(testSignature);
//         });

//         it('should handle empty string signature as null', () => {
//             const auth = new Authorization({ signature: '' });
//             expect(auth.signature).toBeNull();
//         });

//         it('should handle empty Uint8Array signature as null', () => {
//             const auth = new Authorization({ signature: new Uint8Array(0) });
//             expect(auth.signature).toBeNull();
//         });
//     });

//     describe('toUint8Array', () => {
//         it('should serialize empty authorization', () => {
//             const auth = new Authorization();
//             const bytes = auth.toUint8Array();
//             expect(bytes).toBeInstanceOf(Uint8Array);
//             expect(bytes[0]).toBe(0); // No flags set
//         });

//         it('should serialize authorization with signature only', () => {
//             const auth = new Authorization({ signature: testSignature });
//             const bytes = auth.toUint8Array();
//             expect(bytes[0] & 1).toBe(1); // Signature flag set
//             expect(bytes[0] & 2).toBe(0); // PublicKey flag not set
//             expect(bytes[0] & 4).toBe(0); // Moniker flag not set
//             expect(bytes[0] & 8).toBe(0); // Address flag not set
//         });

//         it('should serialize authorization with all fields', () => {
//             const auth = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });
//             const bytes = auth.toUint8Array();
//             expect(bytes[0] & 1).toBe(1); // Signature flag set
//             expect(bytes[0] & 2).toBe(2); // PublicKey flag set
//             expect(bytes[0] & 4).toBe(4); // Moniker flag set
//             expect(bytes[0] & 8).toBe(8); // Address flag set
//         });

//         it('should serialize and deserialize correctly', () => {
//             const original = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });
            
//             const bytes = original.toUint8Array();
//             const deserialized = Authorization.fromUint8Array(bytes);
            
//             expect(deserialized.equals(original)).toBe(true);
//         });
//     });

//     describe('fromUint8Array', () => {
//         it('should deserialize empty authorization', () => {
//             const bytes = new Uint8Array([0]); // No flags set
//             const auth = Authorization.fromUint8Array(bytes);
//             expect(auth.signature).toBeNull();
//             expect(auth.publicKey).toBeNull();
//             expect(auth.moniker).toBeNull();
//             expect(auth.address).toBeNull();
//         });

//         it('should deserialize authorization with signature only', () => {
//             const original = new Authorization({ signature: testSignature });
//             const bytes = original.toUint8Array();
//             const deserialized = Authorization.fromUint8Array(bytes);
            
//             expect(uint8array.toHex(deserialized.signature)).toBe(testSignature);
//             expect(deserialized.publicKey).toBeNull();
//             expect(deserialized.moniker).toBeNull();
//             expect(deserialized.address).toBeNull();
//         });

//         it('should handle malformed data gracefully', () => {
//             const bytes = new Uint8Array([1]); // Signature flag set but no data
//             expect(() => Authorization.fromUint8Array(bytes)).toThrow();
//         });
//     });

//     describe('toJSON', () => {
//         it('should convert empty authorization to JSON', () => {
//             const auth = new Authorization();
//             const json = auth.toJSON();
//             expect(json).toEqual({
//                 signature: null,
//                 publicKey: null,
//                 moniker: null,
//                 address: null
//             });
//         });

//         it('should convert full authorization to JSON', () => {
//             const auth = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });
            
//             const json = auth.toJSON();
//             expect(json.signature).toBe(testSignature);
//             expect(json.publicKey).toBe(testPublicKey);
//             expect(json.moniker).toBe(testMoniker);
//             expect(json.address).toBe(testAddress);
//         });
//     });

//     describe('fromJSON', () => {
//         it('should create authorization from JSON', () => {
//             const json = {
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             };
            
//             const auth = Authorization.fromJSON(json);
//             expect(uint8array.toHex(auth.signature)).toBe(testSignature);
//             expect(uint8array.toHex(auth.publicKey)).toBe(testPublicKey);
//             expect(auth.moniker).toBe(testMoniker);
//             expect(auth.address).toBe(testAddress);
//         });

//         it('should handle null values in JSON', () => {
//             const json = {
//                 signature: null,
//                 publicKey: null,
//                 moniker: null,
//                 address: null
//             };
            
//             const auth = Authorization.fromJSON(json);
//             expect(auth.signature).toBeNull();
//             expect(auth.publicKey).toBeNull();
//             expect(auth.moniker).toBeNull();
//             expect(auth.address).toBeNull();
//         });
//     });

//     describe('toHash', () => {
//         it('should generate consistent hash', () => {
//             const auth = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });
            
//             const hash1 = auth.toHash();
//             const hash2 = auth.toHash();
//             expect(hash1).toBe(hash2);
//         });

//         it('should generate different hashes for different authorizations', () => {
//             const auth1 = new Authorization({ signature: testSignature });
//             const auth2 = new Authorization({ signature: testPublicKey });
            
//             expect(auth1.toHash()).not.toBe(auth2.toHash());
//         });

//         it('should return Uint8Array when encoding is not hex', () => {
//             const auth = new Authorization({ signature: testSignature });
//             const hash = auth.toHash('bytes');
//             expect(hash).toBeInstanceOf(Uint8Array);
//         });
//     });

//     describe('toHex', () => {
//         it('should convert to hex string', () => {
//             const auth = new Authorization({ signature: testSignature });
//             const hex = auth.toHex();
//             expect(typeof hex).toBe('string');
//             expect(hex.length % 2).toBe(0); // Even length for hex
//         });

//         it('should be reversible with fromHex', () => {
//             const original = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });
            
//             const hex = original.toHex();
//             const restored = Authorization.fromHex(hex);
//             expect(restored.equals(original)).toBe(true);
//         });
//     });

//     describe('fromHex', () => {
//         it('should create authorization from hex string', () => {
//             const auth = new Authorization({ signature: testSignature });
//             const hex = auth.toHex();
//             const restored = Authorization.fromHex(hex);
            
//             expect(uint8array.toHex(restored.signature)).toBe(testSignature);
//         });
//     });

//     describe('Validation methods', () => {
//         describe('hasSignature', () => {
//             it('should return true when signature exists', () => {
//                 const auth = new Authorization({ signature: testSignature });
//                 expect(auth.hasSignature()).toBe(true);
//             });

//             it('should return false when signature is null', () => {
//                 const auth = new Authorization();
//                 expect(auth.hasSignature()).toBe(false);
//             });
//         });

//         describe('hasPublicKey', () => {
//             it('should return true when publicKey exists', () => {
//                 const auth = new Authorization({ publicKey: testPublicKey });
//                 expect(auth.hasPublicKey()).toBe(true);
//             });

//             it('should return false when publicKey is null', () => {
//                 const auth = new Authorization();
//                 expect(auth.hasPublicKey()).toBe(false);
//             });
//         });

//         describe('isValid', () => {
//             it('should return true when signature exists', () => {
//                 const auth = new Authorization({ signature: testSignature });
//                 expect(auth.isValid()).toBe(true);
//             });

//             it('should return false when no signature', () => {
//                 const auth = new Authorization({ publicKey: testPublicKey });
//                 expect(auth.isValid()).toBe(false);
//             });
//         });

//         describe('isEmpty', () => {
//             it('should return true for empty authorization', () => {
//                 const auth = new Authorization();
//                 expect(auth.isEmpty()).toBe(true);
//             });

//             it('should return false when any field is set', () => {
//                 const auth = new Authorization({ moniker: testMoniker });
//                 expect(auth.isEmpty()).toBe(false);
//             });
//         });
//     });

//     describe('getTypeFlags', () => {
//         it('should return correct flags for different combinations', () => {
//             const empty = new Authorization();
//             expect(empty.getTypeFlags()).toBe(0);

//             const withSig = new Authorization({ signature: testSignature });
//             expect(withSig.getTypeFlags()).toBe(1);

//             const withPubKey = new Authorization({ publicKey: testPublicKey });
//             expect(withPubKey.getTypeFlags()).toBe(2);

//             const withMoniker = new Authorization({ moniker: testMoniker });
//             expect(withMoniker.getTypeFlags()).toBe(4);

//             const withAddress = new Authorization({ address: testAddress });
//             expect(withAddress.getTypeFlags()).toBe(8);

//             const withAll = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });
//             expect(withAll.getTypeFlags()).toBe(15); // 1+2+4+8
//         });
//     });

//     describe('clone', () => {
//         it('should create independent copy', () => {
//             const original = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });
            
//             const clone = original.clone();
//             expect(clone.equals(original)).toBe(true);
//             expect(clone).not.toBe(original);
//             expect(clone.signature).not.toBe(original.signature); // Different Uint8Array instances
//         });

//         it('should handle null values', () => {
//             const original = new Authorization();
//             const clone = original.clone();
//             expect(clone.equals(original)).toBe(true);
//         });
//     });

//     describe('equals', () => {
//         it('should return true for identical authorizations', () => {
//             const auth1 = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });
            
//             const auth2 = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });
            
//             expect(auth1.equals(auth2)).toBe(true);
//         });

//         it('should return false for different signatures', () => {
//             const auth1 = new Authorization({ signature: testSignature });
//             const auth2 = new Authorization({ signature: testPublicKey });
//             expect(auth1.equals(auth2)).toBe(false);
//         });

//         it('should return false for different publicKeys', () => {
//             const auth1 = new Authorization({ publicKey: testPublicKey });
//             const auth2 = new Authorization({ publicKey: testSignature });
//             expect(auth1.equals(auth2)).toBe(false);
//         });

//         it('should return false for different monikers', () => {
//             const auth1 = new Authorization({ moniker: 'test1' });
//             const auth2 = new Authorization({ moniker: 'test2' });
//             expect(auth1.equals(auth2)).toBe(false);
//         });

//         it('should return false for different addresses', () => {
//             const auth1 = new Authorization({ address: 'addr1' });
//             const auth2 = new Authorization({ address: 'addr2' });
//             expect(auth1.equals(auth2)).toBe(false);
//         });

//         it('should return false when comparing with non-Authorization object', () => {
//             const auth = new Authorization({ signature: testSignature });
//             expect(auth.equals({})).toBe(false);
//             expect(auth.equals(null)).toBe(false);
//             expect(auth.equals('string')).toBe(false);
//         });

//         it('should handle null vs undefined correctly', () => {
//             const auth1 = new Authorization({ signature: testSignature });
//             const auth2 = new Authorization({ signature: testSignature, publicKey: null });
//             expect(auth1.equals(auth2)).toBe(true);
//         });
//     });

//     describe('Round-trip compatibility', () => {
//         it('should maintain data integrity through all conversions', () => {
//             const original = new Authorization({
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//             });

//             // Test toUint8Array -> fromUint8Array
//             const bytes = original.toUint8Array();
//             const fromBytes = Authorization.fromUint8Array(bytes);
//             expect(fromBytes.equals(original)).toBe(true);

//             // Test toJSON -> fromJSON
//             const json = original.toJSON();
//             const fromJson = Authorization.fromJSON(json);
//             expect(fromJson.equals(original)).toBe(true);

//             // Test toHex -> fromHex
//             const hex = original.toHex();
//             const fromHex = Authorization.fromHex(hex);
//             expect(fromHex.equals(original)).toBe(true);

//             // Test hash consistency
//             expect(original.toHash()).toBe(fromBytes.toHash());
//             expect(original.toHash()).toBe(fromJson.toHash());
//             expect(original.toHash()).toBe(fromHex.toHash());
//         });
//     });

//     describe('Edge cases', () => {
//         it('should handle very long moniker and address', () => {
//             const longString = 'a'.repeat(1000);
//             const auth = new Authorization({
//                 signature: testSignature,
//                 moniker: longString,
//                 address: longString
//             });

//             const bytes = auth.toUint8Array();
//             const restored = Authorization.fromUint8Array(bytes);
//             expect(restored.equals(auth)).toBe(true);
//         });

//         it('should handle empty strings for moniker and address', () => {
//             const auth = new Authorization({
//                 signature: testSignature,
//                 moniker: '',
//                 address: ''
//             });

//             const bytes = auth.toUint8Array();
//             const restored = Authorization.fromUint8Array(bytes);
//             expect(restored.moniker).toBe(null);
//             expect(restored.address).toBe(null);
//         });

//         it('should handle minimum valid signature', () => {
//             const minSig = '01';
//             const auth = new Authorization({ signature: minSig });
//             expect(auth.hasSignature()).toBe(true);
            
//             const bytes = auth.toUint8Array();
//             const restored = Authorization.fromUint8Array(bytes);
//             expect(uint8array.toHex(restored.signature)).toBe(minSig);
//         });
//     });
//     describe('Process signature', () => {
//         it('should process signature', () => {
//             const auth = new Authorization({ 
//                 signature: testSignature,
//                 publicKey: testPublicKey,
//                 moniker: testMoniker,
//                 address: testAddress
//              });
//              const valid = auth.verifySignatures(auth, testPublicKey);
//              expect(valid.valid).toBe(false);

             
//         });
//     });
// });
