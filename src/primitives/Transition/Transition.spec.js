import { describe, it, expect } from '@scintilla-network/litest';
import Transition from './Transition.js';
import { uint8array, hex } from '@scintilla-network/keys/utils';
import { Identity } from '../Identity/Identity.js';
import { Authorization } from '../Authorization/Authorization.js';
import { Wallet } from '@scintilla-network/wallet';
// Mnemonic {
//     phrase: 'dune pottery office job join lecture almost human wolf order squeeze milk knee jewel seek column bus lens know spell merry jealous gain ketchup'
//     Pubkey - 026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101 / Private: 337adff26342dfbf2bf140532ebd1c77fcd5a23a520a07a83fb78969821070b3
// }
describe('Transition', () => {
    it('initializes with default values if no arguments are provided', () => {
        const transition = new Transition();
        expect(transition.kind).toBe('TRANSITION');
        expect(transition.cluster).toBeNull();
        expect(transition.action).toBeNull();
        expect(transition.type).toBeNull();
        expect(transition.data).toEqual({});
        expect(Number(transition.timestamp)).toBeLessThanOrEqual(Date.now());
        expect(transition.authorizations).toEqual([]);
        expect(transition.fees).toEqual([]);
    });

    it('initializes with custom values', () => {
        const customTransition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: [{ amount: 1000, currency: 'USD' }],
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
        expect(customTransition.data).toEqual([{ amount: 1000, currency: 'USD' }]);
        expect(Number(customTransition.timestamp)).toBe(1625097600000);
        expect(customTransition.authorizations).toEqual([
            {
                signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                moniker: null,
                address: null,
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
            data: [{ amount: 1000, currency: 'USD' }],
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
            kind: 'TRANSITION',
            version: 1,
            cluster: 'finance',
            timestamp: 1625097600000n,
            action: 'transfer',
            type: 'asset',
            data: [{ amount: 1000, currency: 'USD' }],
            timelock: { startTick: 0n, endTick: 0n },
            fees: [
                {
                    asset: 'ETH',
                    amount: 0.01,
                    payer: 'payer1',
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

        expect(transition.toJSON()).toEqual(expectedJSON);
    });


    it('computeHash method returns the correct hash', () => {
        const transition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: [{ amount: 1000, currency: 'USD' }],
            timestamp: 1625097600000,
        });

        const hash = transition.toHash('hex');
        expect(hash).toBeDefined();
        expect(hash).toBe('c75ea45016d48fdffb8135d8bb0f3d0545dc3f37a5e88356030d44158f1a7cf9');
    });


    it('toBuffer method returns the correct buffer', () => {
        const transition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: [{ amount: 1000, currency: 'USD' }],
            timestamp: 1625097600000,
        });

        const buffer = transition.toUint8Array();
        expect(buffer).toBeInstanceOf(Uint8Array);
        expect(buffer.length).toBe(78);
        expect(hex.fromUint8Array(buffer)).toBe('09010766696e616e6365fd007c5d5f7a010000087472616e736665720561737365742318012054171b110a0206616d6f756e740863757272656e63790251fde80350035553440000031800000000');
    });

    it('toHex method returns the correct hex string', () => {
        const transition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: [{ amount: 1000, currency: 'USD' }],
            timestamp: 1625097600000,
        });

        const hex = transition.toHex();
        expect(hex).toBe('09010766696e616e6365fd007c5d5f7a010000087472616e736665720561737365742318012054171b110a0206616d6f756e740863757272656e63790251fde80350035553440000031800000000');
        expect(hex).toMatch(/^[0-9a-f]+$/);
    });

    it('toUint8Array method returns the correct Uint8Array', () => {
        const transition = new Transition({
            cluster: 'finance',
            action: 'transfer',
            type: 'asset',
            data: [{ amount: 1000, currency: 'USD' }],
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
        expect(transition.authorizations[0]).toEqual(new Authorization(authorization));
        expect(transition.authorizations.length).toBe(1);
    });

    it('verifySignature method returns true for valid signature', async () => {
        // const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk').getAccount(0).getPersona('alice');
        const transition = new Transition({
            timestamp: 1720130703556
        });
        const authorization = { publicKey: '02579ebe87e5972e6a314f479f868dbec870d42dfda787cebdcbc8b73c15f5e9b7', signature: 'e501d8e75f50a17e9afe3a638546640292778992c231deccb8d229fb9188c6c039e4c22d3484bd1d8648920b6e855a174a4c2566948dd8e57b86637465504f6d' };

        transition.addAuthorization(authorization);

        try {
            const valid = transition.verifyAuthorizations();
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
            publicKey: '02579ebe87e5972e6a314f479f868dbec870d42dfda787cebdcbc8b73c15f5e9b7',
            signature: 'e501d8e75f50a17e9afe3a638546640292778992c231deccb8d229fb9188c6c039e4c22d3484bd1d8648920b6e855a174a4c2566948dd8e57b86637465504f6d'
        };

        transition.addAuthorization(authorization);
        const validation = transition.validate();

        expect(validation).toEqual({ valid: true, error: '' });
    });

    it('isValid method returns true for valid transition', () => {
        const transition = new Transition({
            timestamp: 1720130703556
        });
        const authorization = { publicKey: '02579ebe87e5972e6a314f479f868dbec870d42dfda787cebdcbc8b73c15f5e9b7', signature: 'e501d8e75f50a17e9afe3a638546640292778992c231deccb8d229fb9188c6c039e4c22d3484bd1d8648920b6e855a174a4c2566948dd8e57b86637465504f6d' };

        transition.addAuthorization(authorization);

        const isValid = transition.isValid();

        expect(isValid).toBe(true);
    });

    it('isValidAtTick method returns true for valid transition', () => {
        const now = BigInt(Date.now());
        const transition = new Transition({
            timelock: {
                startTick: now - 1000n,
                endTick: now + 1000n,
            }
        });
        expect(transition.isValidAtTick(now)).toBe(true);
        expect(transition.isValidAtTick(now + 2000n)).toBe(false);
        expect(transition.isValidAtTick(now - 2000n)).toBe(false);

        const transition2 = new Transition();
        expect(transition2.isValidAtTick(0n)).toBe(true);
        expect(transition2.isValidAtTick(999999n)).toBe(true);
        expect(transition2.isValidAtTick(now)).toBe(true);
        expect(transition2.isValidAtTick(now + 2000n)).toBe(true);
        expect(transition2.isValidAtTick(now - 2000n)).toBe(true);
      
    });

    describe('toUint8Array', () => {
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
                data: [coreDAOIdentity.toJSON()],
            });
            
            const uint8Array = createCoreDAOIdentityTransition.toUint8Array();
            expect(uint8Array).toEqual(createCoreDAOIdentityTransition.toUint8Array());

            const parsed = Transition.fromUint8Array(uint8Array);
            expect(parsed.toHash()).toEqual(createCoreDAOIdentityTransition.toHash());
            expect(parsed.toHex()).toEqual('09010d636f72652e6964656e74697479fdb78f65a28d01000006435245415445084944454e544954593b18013812084944454e544954590004636f7265027b7d245b5b227363742e7363696e74696c6c612d6c616273222c312c302c302c302c302c305d5d0000031800000000');
            expect(parsed.toHash('hex')).toEqual('1d5a1b8426c4ec63c7871d60b4318e289752a528e60dbedbd136f64dca736be6');

            const parsedFromHex = Transition.fromHex(parsed.toHex());
            expect(parsedFromHex.toHash('hex')).toEqual(parsed.toHash('hex'));
            expect(parsedFromHex.toJSON()).toEqual(parsed.toJSON());
            expect(parsedFromHex.toUint8Array()).toEqual(parsed.toUint8Array());
        });
    });
});
