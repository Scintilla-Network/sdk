// import { describe, it, expect } from 'vitest';
import { describe, it, expect } from '@scintilla-network/litest';
import { Transfer } from './Transfer.js';
import { Wallet } from '@scintilla-network/wallet';
import { Asset } from '../Asset/Asset.js'

describe('Transfer', () => {
    it('should be able to create a Transfer instance', () => {
        const transfer = new Transfer();
        expect(transfer).toBeDefined();
    });

    it('should have a kind property', () => {
        const transfer = new Transfer();
        expect(transfer.kind).toBe('TRANSFER');
    });

    it('should have a cluster property', () => {
        const transfer = new Transfer();
        expect(transfer.cluster).toBeNull();
    });

    it('should have an action property', () => {
        const transfer = new Transfer();
        expect(transfer.action).toBeNull();
    });

    it('should have a type property', () => {
        const transfer = new Transfer();
        expect(transfer.type).toBeNull();
    });

    it('should have a data property', () => {
        const transfer = new Transfer();
        expect(transfer.data).toEqual([]);
    });

    it('should have a timestamp property', () => {
        const transfer = new Transfer();
        expect(transfer.timestamp).toBeDefined();
    });

    it('should have a toHex method', () => {
        const transfer = new Transfer();
        expect(transfer.toHex).toBeDefined();
    });

    it('should have a toUint8Array method', () => {
        const transfer = new Transfer();
        expect(transfer.toUint8Array).toBeDefined();
    });

    it('should have a toHash method', () => {
        const transfer = new Transfer();
        expect(transfer.toHash).toBeDefined();
    });

    it('should have a toJSON method', () => {
        const transfer = new Transfer();
        expect(transfer.toJSON).toBeDefined();
    });
});

describe('Transfer.toHash', () => {
    it('should return a string', () => {
        const transfer = new Transfer();
        const result = transfer.toHash('hex');
        expect(typeof result).toBe('string');
    });
    it('should return consistent hash', () => {
        const transfer = new Transfer({
            timestamp: 1234567890,
        });
        const result = transfer.toHash('hex');
        expect(result).toBe('09235b732ce5d0e45e95d409ca7934de5ebf24b0c327ae522f9cc825cfc49dc1');
    });
});

describe('Transfer - Functions', () => {
    it('should initialize with default values', () => {
        const transfer = new Transfer();
        expect(transfer.version).toBe(1);
        expect(transfer.kind).toBe("TRANSFER");
        expect(transfer.action).toBeNull();
        expect(transfer.type).toBeNull();
        expect(transfer.data).toEqual([]);
        expect(transfer.timestamp).toBeDefined();
    });
    it('should multisig', () => {
        const transfer = new Transfer({
            timestamp: 1234567890,
            cluster: 'core.banking',
            action: 'EXECUTE',
            type: 'ASSET',
            data: [{
                asset: 'SCT',
                amount: 300000 * 10 ** 8,
                recipient: 'tech-dao',
            }],
            sender: 'techdao',
            authorizations:[{
                moniker: 'alex',
                publicKey: '1234567890',
                signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
            },{
                moniker: 'bob',
                publicKey: '1234567890',
                signature: '500775d65ce45a4209fb584e6d16205b69e7e26fe84022ef455b90a5a8ab5914412cc87d7b6143991483b3bd3f71cf8bb89b055b2a3c6083046959af5eb9c2bd',
            }],
            fees: [{
                amount: 1000,
                asset: 'SCT',
                payer: 'alex',
            }],
        });

        expect(transfer.cluster).toBe('core.banking');
        expect(transfer.action).toBe('EXECUTE');
        expect(transfer.type).toBe('ASSET');
        expect(transfer.data).toEqual([{
            asset: 'SCT',
            amount: 300000 * 10 ** 8,
            recipient: 'tech-dao',
        }]);
        expect(transfer.timestamp).toBeDefined();

        expect(transfer.fees).toEqual([{
            amount: 1000,
            asset: 'SCT',
            payer: 'alex',
        }]);

    });
    describe('toUint8Array', () => {
        it('should have the same uint8Array', async () => {
            const transfer = new Transfer({
                cluster: 'core.banking',
                action: 'EXECUTE',
                type: 'ASSET',
                timestamp: 1758835630175n,
            });
            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk').getAccount(0).getPersona('alice').getSigner();
            await transfer.sign(signer);

            const uint8Array = transfer.toUint8Array();
            expect(uint8Array).toEqual(transfer.toUint8Array());
            const hash = transfer.toHash('hex');
            const parsed = Transfer.fromUint8Array(uint8Array);
            expect(parsed.toHash('hex')).toBe(hash);

            const isValid = parsed.isValid();
            expect(isValid).toBe(true);
            const verify = parsed.verifyAuthorizations();
            expect(verify).toBe(true);
            const validate = parsed.validate();
            expect(validate.valid).toBe(true);
            expect(validate.error).toBe('');
        });
    });
    describe('isValidAtTick', () => {
        it('isValidAtTick method returns true for valid transfer', () => {
            const now = BigInt(Date.now());
            const transfer = new Transfer({
                timelock: {
                    startTick: now - 1000n,
                    endTick: now + 1000n,
                }
            });
            expect(transfer.isValidAtTick(now)).toBe(true);
            expect(transfer.isValidAtTick(now + 2000n)).toBe(false);
            expect(transfer.isValidAtTick(now - 2000n)).toBe(false);
    
            const transfer2 = new Transfer();
            expect(transfer2.isValidAtTick(0n)).toBe(true);
            expect(transfer2.isValidAtTick(999999n)).toBe(true);
            expect(transfer2.isValidAtTick(now)).toBe(true);
            expect(transfer2.isValidAtTick(now + 2000n)).toBe(true);
            expect(transfer2.isValidAtTick(now - 2000n)).toBe(true);
          
        });
    });
    describe('Transfer data', () => {
        it('should handle data', ()=>{

            const someAsset = new Asset({
                name: 'Some Asset',
                symbol: 'SOME',
                decimals: 18,
            });

            const transfer = new Transfer({
                cluster: 'core.banking',
                action: 'EXECUTE',
                type: 'ASSET',
                timestamp: 1758835630175n,
                data: [someAsset.toJSON()],
            });
            const uint8Array = transfer.toUint8Array();
            const parsed = Transfer.fromUint8Array(uint8Array);
            expect(parsed.toHash('hex')).toBe(transfer.toHash('hex'));
            expect(parsed.data[0].toJSON()).toEqual(someAsset.toJSON());
        });
    })
})

