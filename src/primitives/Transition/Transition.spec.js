// import { describe, it, expect } from 'vitest';
import { describe, it, expect } from '@scintilla-network/litest';
import Transition from './Transition.js';
import { uint8array } from '@scintilla-network/keys/utils';
import { Identity } from '../Identity/Identity.js';
// Mnemonic {
//     phrase: 'dune pottery office job join lecture almost human wolf order squeeze milk knee jewel seek column bus lens know spell merry jealous gain ketchup'
// }
// Pubkey - 026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101 / Private: 337adff26342dfbf2bf140532ebd1c77fcd5a23a520a07a83fb78969821070b3
describe('Transition', () => {
    it('initializes with default values if no arguments are provided', () => {
        const transition = new Transition();
        expect(transition.kind).toBe('TRANSITION');
        expect(transition.cluster).toBeNull();
        expect(transition.action).toBeNull();
        expect(transition.type).toBeNull();
        expect(transition.data).toEqual({});
        expect(transition.timestamp).toBeLessThanOrEqual(Date.now());
        expect(transition.authorizations).toEqual([]);
        expect(transition.fees).toEqual([]);
    });

    it('initializes with custom values', () => {
        const customTransition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: { amount: 1000, currency: 'USD' },
            timestamp: 1625097600000,
            authorizations: [
                {
                    publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                    signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                }
            ],
            fees: [
                {
                    asset: 'ETH',
                    amount: 0.01,
                    payer: 'payer1'
                }
            ]
        });

        expect(customTransition.cluster).toBe('finance');
        expect(customTransition.action).toBe('transfer');
        expect(customTransition.type).toBe('asset');
        expect(customTransition.data).toEqual({ amount: 1000, currency: 'USD' });
        expect(customTransition.timestamp).toBe(1625097600000);
        expect(customTransition.authorizations).toEqual([
            {
                publicKey: uint8array.fromHex('026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101'),
                signature: uint8array.fromHex('6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605'),
            }
        ]);
        expect(customTransition.fees).toEqual([
            {
                asset: 'ETH',
                amount: 0.01,
                payer: 'payer1'
            }
        ]);
    });

    it('toJSON method returns the correct object', () => {
        const transition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: { amount: 1000, currency: 'USD' },
            timestamp: 1625097600000,
            authorizations: [
                {
                    publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                    signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                }
            ],
            fees: [
                {
                    asset: 'ETH',
                    amount: 0.01,
                    payer: 'payer1'
                }
            ]
        });

        const expectedJSON = {
            version: 1,
            kind: 'TRANSITION',
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: { amount: 1000, currency: 'USD' },
            timestamp: 1625097600000,
            authorizations: [
                {
                    publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                    signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                }
            ],
            fees: [
                {
                    asset: 'ETH',
                    amount: 0.01,
                    payer: 'payer1',
                }
            ]
        };

        expect(transition.toJSON()).toEqual(expectedJSON);
    });

    it('computeHash method returns the correct hash', () => {
        const transition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: { amount: 1000, currency: 'USD' },
            timestamp: 1625097600000,
        });

        const hash = transition.computeHash();
        expect(hash).toBeDefined();
    });

    it('toBuffer method returns the correct buffer', () => {
        const transition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: { amount: 1000, currency: 'USD' },
            timestamp: 1625097600000,
        });

        const buffer = transition.toBuffer();
        expect(buffer).toBeInstanceOf(Uint8Array);
    });

    it('toHex method returns the correct hex string', () => {
        const transition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: { amount: 1000, currency: 'USD' },
            timestamp: 1625097600000,
        });

        const hex = transition.toHex();
        expect(hex).toMatch(/^[0-9a-f]+$/);
    });

    it('toUint8Array method returns the correct Uint8Array', () => {
        const transition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: { amount: 1000, currency: 'USD' },
            timestamp: 1625097600000,
        });

        const uint8Array = transition.toUint8Array();
        expect(uint8Array).toBeInstanceOf(Uint8Array);
    });

    it('addAuthorization method adds a new authorization', () => {
        const transition = new Transition({
            timestamp: 1720130703556
        });
        const authorization = { publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101', signature: 'c5933fc1eec18a29888cb5054bb126578048c5bf732127b23ede48ee0ef8d5dc544f43b36c14038b0d4e1854fea7413ad7ecd2fde4868450f204e3a629b0dda1' };

        transition.addAuthorization(authorization);

        expect(transition.authorizations).toContainEqual(authorization);
    });

    it('verifySignature method returns true for valid signature', () => {
        const transition = new Transition({
            timestamp: 1720130703556
        });
        const authorization = { publicKey: '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770', signature: '0fbd454d848d7d160de980d7e884e3eaec0c21c8a2e47fbe187d911a7e3ec0c418f6aa22486eed5c1fec69a0f689ca9fd7bd18b9851454c85474ad9ddf5058ee' };

        transition.addAuthorization(authorization);

        try {
            const valid = transition.verifySignature();
            expect(valid).toEqual(true);
        } catch (error) {
            console.error(error);
        }
    });

    it('validate method returns correct validation result', () => {
        const transition = new Transition({
            timestamp: 1720130703556
        });
        const authorization = { 
            publicKey: '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770',
            signature: '0fbd454d848d7d160de980d7e884e3eaec0c21c8a2e47fbe187d911a7e3ec0c418f6aa22486eed5c1fec69a0f689ca9fd7bd18b9851454c85474ad9ddf5058ee'
        };

        transition.addAuthorization(authorization);
        const validation = transition.validate();

        expect(validation).toEqual({ valid: true, error: '' });
    });

    it('isValid method returns true for valid transition', () => {
        const transition = new Transition({
            timestamp: 1720130703556
        });
        const authorization = { publicKey: '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770', signature: '0fbd454d848d7d160de980d7e884e3eaec0c21c8a2e47fbe187d911a7e3ec0c418f6aa22486eed5c1fec69a0f689ca9fd7bd18b9851454c85474ad9ddf5058ee' };

        transition.addAuthorization(authorization);

        const isValid = transition.isValid();

        expect(isValid).toBe(true);
    });
    describe.only('toUint8Array', () => {
        it('should have the same uint8Array', () => {
            const coreDAOIdentity = new Identity({
                parent: null,
                moniker: 'core',
                members: [
                    ['sct.scintilla-labs', 1]
                ]
            });
        
            const createCoreDAOIdentityTransition = new Transition({
                cluster: 'core.identity',
                type: 'IDENTITY',
                action: 'CREATE',
                timestamp: 1707826561431 + 20000,
                data: coreDAOIdentity.toJSON(),
            });
            
            const uint8Array = createCoreDAOIdentityTransition.toUint8Array();
            expect(uint8Array).toEqual(createCoreDAOIdentityTransition.toUint8Array());

            const parsed = Transition.fromUint8Array(uint8Array);
            expect(parsed.toHash()).toEqual(createCoreDAOIdentityTransition.toHash());
            expect(parsed.toHex()).toEqual('09010d636f72652e6964656e7469747906435245415445084944454e544954595c7b22706172656e74223a6e756c6c2c226d6f6e696b6572223a22636f7265222c226d656d62657273223a5b5b227363742e7363696e74696c6c612d6c616273222c312c302c302c302c302c305d5d2c227265636f726473223a7b7d7dffb78f65a28d0100000000');
            expect(parsed.toHash()).toEqual('c36625e730d8d54064410400b32c381c8450d1520afad8175ec23af6acf6c3ca');

        });
    });
});
