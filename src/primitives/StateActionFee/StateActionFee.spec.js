import { describe, it, expect } from '@scintilla-network/litest';
import { StateActionFee } from './StateActionFee.js';
import { uint8array } from '@scintilla-network/keys/utils';

describe('StateActionFee', () => {
    it('initializes with default values if no arguments are provided', () => {
        const fee = new StateActionFee();
        expect(fee.asset).toBeNull();
        expect(fee.amount).toBe(0n);
        expect(fee.payer).toBeNull();
        expect(fee.voucher).toBeNull();
    });

    it('initializes with custom values', () => {
        const fee = new StateActionFee({
            asset: 'SCT',
            amount: 1000n,
            payer: 'alice',
        });

        expect(fee.asset).toBe('SCT');
        expect(fee.amount).toBe(1000n);
        expect(fee.payer).toBe('alice');
        expect(fee.voucher).toBeNull();
    });

    it('initializes with voucher', () => {
        const fee = new StateActionFee({
            asset: 'SCT',
            amount: 1000n,
            payer: 'alice',
            voucher: 'cf82495d4cac1aea54c04c0840d0e6107cec7e632f88f63a446af4b9efedd147'
        });

        expect(fee.voucher).toBe('cf82495d4cac1aea54c04c0840d0e6107cec7e632f88f63a446af4b9efedd147');
    });

    it('converts amount to BigInt', () => {
        const fee1 = new StateActionFee({
            asset: 'SCT',
            amount: '1000',
            payer: 'alice',
        });

        const fee2 = new StateActionFee({
            asset: 'SCT',
            amount: 1000,
            payer: 'alice',
        });

        expect(fee1.amount).toBe(1000n);
        expect(fee2.amount).toBe(1000n);
    });

    describe('toJSON', () => {
        it('should convert to JSON', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
            });

            const json = fee.toJSON();

            expect(json).toEqual({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
            });
        });

        it('should include voucher in JSON if present', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
                voucher: 'cf82495d4cac1aea54c04c0840d0e6107cec7e632f88f63a446af4b9efedd147'
            });

            const json = fee.toJSON();

            expect(json).toEqual({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
                voucher: 'cf82495d4cac1aea54c04c0840d0e6107cec7e632f88f63a446af4b9efedd147'
            });
        });
    });

    describe('fromJSON', () => {
        it('should create from JSON', () => {
            const json = {
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
            };

            const fee = StateActionFee.fromJSON(json);

            expect(fee.asset).toBe('SCT');
            expect(fee.amount).toBe(1000n);
            expect(fee.payer).toBe('alice');
        });
    });

    describe('toUint8Array and fromUint8Array', () => {
        it('should serialize and deserialize', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
            });

            const uint8Array = fee.toUint8Array();
            expect(uint8Array).toBeInstanceOf(Uint8Array);

            const parsed = StateActionFee.fromUint8Array(uint8Array);

            expect(parsed.asset).toBe(fee.asset);
            expect(parsed.amount).toBe(fee.amount);
            expect(parsed.payer).toBe(fee.payer);
        });

        it('should handle fee with voucher', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
                voucher: 'cf82495d4cac1aea54c04c0840d0e6107cec7e632f88f63a446af4b9efedd147'
            });

            const uint8Array = fee.toUint8Array();
            const parsed = StateActionFee.fromUint8Array(uint8Array);

            expect(parsed.voucher).toBe(fee.voucher);
        });

        it('should maintain consistency across multiple serializations', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
            });

            const uint8Array1 = fee.toUint8Array();
            const uint8Array2 = fee.toUint8Array();

            expect(uint8array.toHex(uint8Array1)).toBe(uint8array.toHex(uint8Array2));
        });

        it('should handle large amounts', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000000000000000000n,
                payer: 'alice',
            });

            const uint8Array = fee.toUint8Array();
            const parsed = StateActionFee.fromUint8Array(uint8Array);

            expect(parsed.amount).toBe(1000000000000000000n);
        });
    });

    describe('toHex and fromHex', () => {
        it('should convert to hex and back', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
            });

            const hex = fee.toHex();
            expect(typeof hex).toBe('string');
            expect(hex).toMatch(/^[0-9a-f]+$/);

            const parsed = StateActionFee.fromHex(hex);

            expect(parsed.asset).toBe(fee.asset);
            expect(parsed.amount).toBe(fee.amount);
            expect(parsed.payer).toBe(fee.payer);
        });
    });

    describe('validate', () => {
        it('should validate correct fee', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
            });

            const validation = fee.validate();

            expect(validation.valid).toBe(true);
            expect(validation.error).toBe('');
        });

        it('should return invalid when asset is missing', () => {
            const fee = new StateActionFee({
                amount: 1000n,
                payer: 'alice',
            });

            const validation = fee.validate();

            expect(validation.valid).toBe(false);
            expect(validation.error).toBe('Asset is required.');
        });

        it('should return invalid when amount is zero', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 0n,
                payer: 'alice',
            });

            const validation = fee.validate();

            expect(validation.valid).toBe(false);
            expect(validation.error).toBe('Amount must be greater than 0.');
        });

        it('should return invalid when amount is negative', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: -100n,
                payer: 'alice',
            });

            const validation = fee.validate();

            expect(validation.valid).toBe(false);
            expect(validation.error).toBe('Amount must be greater than 0.');
        });

        it('should return invalid when payer is missing', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000n,
            });

            const validation = fee.validate();

            expect(validation.valid).toBe(false);
            expect(validation.error).toBe('Payer is required.');
        });
    });

    describe('isValid', () => {
        it('should return true for valid fee', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
            });

            expect(fee.isValid()).toBe(true);
        });

        it('should return false for invalid fee', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 0n,
                payer: 'alice',
            });

            expect(fee.isValid()).toBe(false);
        });
    });

    describe('fromFeesJSON', () => {
        it('should create fees array from JSON', () => {
            const json = {
                fees: [
                    { asset: 'SCT', amount: 1000n, payer: 'alice' },
                    { asset: 'ETH', amount: 500n, payer: 'bob' }
                ]
            };

            const fees = StateActionFee.fromFeesJSON(json);

            expect(fees.length).toBe(2);
            expect(fees[0]).toBeInstanceOf(StateActionFee);
            expect(fees[0].asset).toBe('SCT');
            expect(fees[1].asset).toBe('ETH');
        });

        it('should return empty array when no fees', () => {
            const fees = StateActionFee.fromFeesJSON({});
            expect(fees).toEqual([]);
        });

        it('should return empty array when fees is undefined', () => {
            const fees = StateActionFee.fromFeesJSON(null);
            expect(fees).toEqual([]);
        });
    });

    describe('toFeesJSON', () => {
        it('should convert fees array to JSON', () => {
            const fees = [
                new StateActionFee({ asset: 'SCT', amount: 1000n, payer: 'alice' }),
                new StateActionFee({ asset: 'ETH', amount: 500n, payer: 'bob' })
            ];

            const json = StateActionFee.toFeesJSON(fees);

            expect(json.length).toBe(2);
            expect(json[0].asset).toBe('SCT');
            expect(json[1].asset).toBe('ETH');
        });

        it('should handle plain objects', () => {
            const fees = [
                { asset: 'SCT', amount: 1000n, payer: 'alice' },
                { asset: 'ETH', amount: 500n, payer: 'bob' }
            ];

            const json = StateActionFee.toFeesJSON(fees);

            expect(json.length).toBe(2);
            expect(json[0].asset).toBe('SCT');
            expect(json[1].asset).toBe('ETH');
        });

        it('should return empty array for null or empty fees', () => {
            expect(StateActionFee.toFeesJSON(null)).toEqual([]);
            expect(StateActionFee.toFeesJSON([])).toEqual([]);
        });
    });

    describe('fromFeesUint8Array and toFeesUint8Array', () => {
        it('should serialize and deserialize fees array', () => {
            const fees = [
                new StateActionFee({ asset: 'SCT', amount: 1000n, payer: 'alice' }),
                new StateActionFee({ asset: 'ETH', amount: 500n, payer: 'bob' })
            ];

            const uint8Array = StateActionFee.toFeesUint8Array(fees);
            expect(uint8Array).toBeInstanceOf(Uint8Array);

            const parsed = StateActionFee.fromFeesUint8Array(uint8Array);

            expect(parsed.length).toBe(2);
            expect(parsed[0].asset).toBe('SCT');
            expect(parsed[0].amount).toBe(1000n);
            expect(parsed[1].asset).toBe('ETH');
            expect(parsed[1].amount).toBe(500n);
        });

        it('should handle empty fees array', () => {
            const fees = [];

            const uint8Array = StateActionFee.toFeesUint8Array(fees);
            const parsed = StateActionFee.fromFeesUint8Array(uint8Array);

            expect(parsed).toEqual([]);
        });

        it('should handle single fee', () => {
            const fees = [
                new StateActionFee({ asset: 'SCT', amount: 1000n, payer: 'alice' })
            ];

            const uint8Array = StateActionFee.toFeesUint8Array(fees);
            const parsed = StateActionFee.fromFeesUint8Array(uint8Array);

            expect(parsed.length).toBe(1);
            expect(parsed[0].asset).toBe('SCT');
        });

        it('should handle plain objects in array', () => {
            const fees = [
                { asset: 'SCT', amount: 1000n, payer: 'alice' },
                { asset: 'ETH', amount: 500n, payer: 'bob' }
            ];

            const uint8Array = StateActionFee.toFeesUint8Array(fees);
            const parsed = StateActionFee.fromFeesUint8Array(uint8Array);

            expect(parsed.length).toBe(2);
            expect(parsed[0].asset).toBe('SCT');
            expect(parsed[1].asset).toBe('ETH');
        });

        it('should handle fees with vouchers', () => {
            const fees = [
                new StateActionFee({
                    asset: 'SCT',
                    amount: 1000n,
                    payer: 'alice',
                    voucher: 'cf82495d4cac1aea54c04c0840d0e6107cec7e632f88f63a446af4b9efedd147'
                })
            ];

            const uint8Array = StateActionFee.toFeesUint8Array(fees);
            const parsed = StateActionFee.fromFeesUint8Array(uint8Array);

            expect(parsed[0].voucher).toBe('cf82495d4cac1aea54c04c0840d0e6107cec7e632f88f63a446af4b9efedd147');
        });
    });

    describe('different asset types', () => {
        it('should handle various asset symbols', () => {
            const assets = ['SCT', 'ETH', 'BTC', 'USDT', 'sct', 'custom-asset'];

            assets.forEach(asset => {
                const fee = new StateActionFee({
                    asset: asset,
                    amount: 1000n,
                    payer: 'alice',
                });

                const uint8Array = fee.toUint8Array();
                const parsed = StateActionFee.fromUint8Array(uint8Array);

                expect(parsed.asset).toBe(asset);
            });
        });
    });

    describe('different amount ranges', () => {
        it('should handle small amounts', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1n,
                payer: 'alice',
            });

            const uint8Array = fee.toUint8Array();
            const parsed = StateActionFee.fromUint8Array(uint8Array);

            expect(parsed.amount).toBe(1n);
        });

        it('should handle very large amounts', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 999999999999999999999999n,
                payer: 'alice',
            });

            const uint8Array = fee.toUint8Array();
            const parsed = StateActionFee.fromUint8Array(uint8Array);

            expect(parsed.amount).toBe(999999999999999999999999n);
        });

        it('should handle typical fee amounts', () => {
            const amounts = [
                100n,
                1000n,
                10000n,
                100000n,
                1000000n,
                10n ** 8n,
                10n ** 18n
            ];

            amounts.forEach(amount => {
                const fee = new StateActionFee({
                    asset: 'SCT',
                    amount: amount,
                    payer: 'alice',
                });

                const uint8Array = fee.toUint8Array();
                const parsed = StateActionFee.fromUint8Array(uint8Array);

                expect(parsed.amount).toBe(amount);
            });
        });
    });

    describe('different payer identities', () => {
        it('should handle various payer formats', () => {
            const payers = [
                'alice',
                'bob',
                'sct.alice',
                'core.banking',
                'sct16r5ed3h8k794luyzp2ht096429c0ku6trvq2x8'
            ];

            payers.forEach(payer => {
                const fee = new StateActionFee({
                    asset: 'SCT',
                    amount: 1000n,
                    payer: payer,
                });

                const uint8Array = fee.toUint8Array();
                const parsed = StateActionFee.fromUint8Array(uint8Array);

                expect(parsed.payer).toBe(payer);
            });
        });
    });

    describe('real-world scenarios', () => {
        it('should handle typical transaction fee', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 10n ** 6n, // 0.01 SCT with 8 decimals
                payer: 'alice',
            });

            expect(fee.isValid()).toBe(true);

            const uint8Array = fee.toUint8Array();
            const parsed = StateActionFee.fromUint8Array(uint8Array);

            expect(parsed.asset).toBe('SCT');
            expect(parsed.amount).toBe(10n ** 6n);
            expect(parsed.payer).toBe('alice');
        });

        it('should handle fee with voucher reference', () => {
            const fee = new StateActionFee({
                asset: 'SCT',
                amount: 1000n,
                payer: 'alice',
                voucher: 'cf82495d4cac1aea54c04c0840d0e6107cec7e632f88f63a446af4b9efedd147'
            });

            expect(fee.isValid()).toBe(true);

            const uint8Array = fee.toUint8Array();
            const parsed = StateActionFee.fromUint8Array(uint8Array);

            expect(parsed.voucher).toBe('cf82495d4cac1aea54c04c0840d0e6107cec7e632f88f63a446af4b9efedd147');
        });

        it('should handle multiple fees for complex transaction', () => {
            const fees = [
                new StateActionFee({ asset: 'SCT', amount: 1000n, payer: 'alice' }),
                new StateActionFee({ asset: 'SCT', amount: 500n, payer: 'bob' }),
                new StateActionFee({ asset: 'ETH', amount: 100n, payer: 'alice' })
            ];

            const uint8Array = StateActionFee.toFeesUint8Array(fees);
            const parsed = StateActionFee.fromFeesUint8Array(uint8Array);

            expect(parsed.length).toBe(3);
            expect(parsed.every(fee => fee.isValid())).toBe(true);
        });

        it('should handle percentage-based fees', () => {
            // 0.02% fee (2 basis points) on 1000000 units
            const transactionAmount = 1000000n;
            const feePercent = 2n; // 0.02%
            const feeAmount = (transactionAmount * feePercent) / 10000n;

            const fee = new StateActionFee({
                asset: 'SCT',
                amount: feeAmount,
                payer: 'alice',
            });

            expect(fee.amount).toBe(200n);
            expect(fee.isValid()).toBe(true);
        });
    });
});
