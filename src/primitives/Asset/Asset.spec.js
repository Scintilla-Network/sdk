// import { describe, it, expect } from 'vitest';
import { describe, it, expect } from '@scintilla-network/litest';
import Asset from './Asset.js';

describe('Asset', () => {
    let asset;
    let customAsset;
    it('initializes with default values if no arguments are provided', () => {
        asset = new Asset({});
        expect(asset.name).toBe('UNDEFINED');
        expect(asset.symbol).toBe('UNDEFINED');
        expect(Number(asset.supply.max)).toEqual(100_000_000 * 10 ** 9);
        expect(asset.decimals).toBe(9n);
        expect(asset.distributions).toEqual([]);
        expect(asset.permissions.mint).toEqual(['scintilla']);
        expect(asset.permissions.burn).toEqual(['scintilla']);
        const fees = asset.fees[0];
        expect(fees.percent).toBe(200n);
        expect(fees.max).toBe(20n * 10n ** 6n);
        expect(asset.metadata).toEqual({});
    });

    it('initializes with values', () => {
        customAsset = new Asset({
            name: 'CustomAsset',
            symbol: 'CAT',
            supply: {
                max: 500_000_000n * 10n ** 8n,
            },
            decimals: 10n,
            distributions: [
                {
                    pattern: "admin",
                    weight: 100n,
                    roles: {
                        proposers: 10n,
                        validators: 40n,
                        treasury: 50n
                    }
                },
            ],
            permissions: {
                mint: ['admin'],
                burn: ['admin'],
            },
            fees: [{type: 'transfer', percent: 200n, max: 100n }],
            metadata: {
                description: 'A custom asset for testing',
                website: 'https://customasset.scintilla.network'
            }
        });

        expect(customAsset.name).toBe('CustomAsset');
        expect(customAsset.symbol).toBe('CAT');
        expect(BigInt(customAsset.supply.max)).toEqual(500_000_000n * 10n ** 8n);
        expect(customAsset.decimals).toBe(10n);
        expect(customAsset.distributions).toEqual([
            {
                pattern: "admin",
                weight: 100n,
                roles: {
                    proposers: 10n,
                    validators: 40n,
                    treasury: 50n   
                }
            },
        ]);
        expect(customAsset.permissions.mint).toEqual(['admin']);
        expect(customAsset.permissions.burn).toEqual(['admin']);
        const fees = customAsset.fees[0];
        console.log(customAsset.fees);
        expect(Number(fees.percent)).toEqual(200);
        expect(Number(fees.max)).toEqual(100);
        expect(customAsset.metadata).toEqual({
            description: 'A custom asset for testing',
            website: 'https://customasset.scintilla.network'
        });
    });

    it('toJSON method returns the correct object', () => {
        asset = new Asset({
            name: 'Scintilla',
            symbol: 'SCT',
            supply: {
                max: 100_000_000n * 10n ** 8n,
            },
            decimals: 8,
            distributions: [
                {
                    pattern: "admin",
                    weight: 100n,
                    roles: {
                        proposers: 10n,
                        validators: 40n,
                        treasury: 50n
                    }
                },
            ],
            permissions: {
                mint: ['scintilla'],
                burn: ['scintilla'],
            },
            fees: [{type: 'transfer', percent: 1n, max: 100n }],
            metadata: {
                description: 'Scintilla token',
                website: 'https://scintilla.example.com'
            }
        });

        const expectedJSON = {
            kind: 'ASSET',
            name: 'Scintilla',
            symbol: 'SCT',
            supply: { max: '10000000000000000', total: '0', circulating: '0' },
            decimals: '8',
            consensus: {
              members: [],
              type: 'QUORUM_PROOF',
              requirements: [],
              distributions: []
            },
            distributions: [ { pattern: 'admin', weight: '100', roles: { proposers: '10', validators: '40', treasury: '50' } } ],
            permissions: { "mint": [ 'scintilla' ], "burn": [ 'scintilla' ] },
            fees: [{type: 'transfer', percent: '1', max: '100' }],
            metadata: {
              description: 'Scintilla token',
              website: 'https://scintilla.example.com'
            }
          }

        expect(asset.toJSON()).toEqual(expectedJSON);
    });
    it('should to have the same hash', () => {
        expect(asset.toHash()).toEqual('8a85d48a9bbd42d7efd885e08e1e7a6ef11cfc220277f337fe80bba9cc429ec7');
        expect(customAsset.toHash()).toEqual('92d375621a881d20e15e972b65b7dabb3aaca7ae09b107454602fa77e43f722d');
    });
    it('should hex to have the same hex', () => {
        expect(asset.toHex()).toEqual('11095363696e74696c6c6103534354fd0000c16ff2862300000008497b22646973747269627574696f6e73223a5b5d2c226d656d62657273223a5b5d2c22726571756972656d656e7473223a5b5d2c2274797065223a2251554f52554d5f50524f4f46227d615b7b227061747465726e223a2261646d696e222c22726f6c6573223a7b2270726f706f73657273223a223130222c227472656173757279223a223530222c2276616c696461746f7273223a223430227d2c22776569676874223a22313030227d5d2b7b226275726e223a5b227363696e74696c6c61225d2c226d696e74223a5b227363696e74696c6c61225d7d012d7b2274797065223a227472616e73666572222c2270657263656e74223a2231222c226d6178223a22313030227d4b7b226465736372697074696f6e223a225363696e74696c6c6120746f6b656e222c2277656273697465223a2268747470733a2f2f7363696e74696c6c612e6578616d706c652e636f6d227d');
        expect(customAsset.toHex()).toEqual('110b437573746f6d417373657403434154fd0000c52ebca2b10000000a497b22646973747269627574696f6e73223a5b5d2c226d656d62657273223a5b5d2c22726571756972656d656e7473223a5b5d2c2274797065223a2251554f52554d5f50524f4f46227d615b7b227061747465726e223a2261646d696e222c22726f6c6573223a7b2270726f706f73657273223a223130222c227472656173757279223a223530222c2276616c696461746f7273223a223430227d2c22776569676874223a22313030227d5d237b226275726e223a5b2261646d696e225d2c226d696e74223a5b2261646d696e225d7d012f7b2274797065223a227472616e73666572222c2270657263656e74223a22323030222c226d6178223a22313030227d5e7b226465736372697074696f6e223a224120637573746f6d20617373657420666f722074657374696e67222c2277656273697465223a2268747470733a2f2f637573746f6d61737365742e7363696e74696c6c612e6e6574776f726b227d');
    });
    it('should fromUint8Array to have the same asset', () => {
        const asset = new Asset({
            name: 'Scintilla',
            symbol: 'SCT',
            supply: {
                max: 100_000_000n * 10n ** 8n,
            },
            decimals: 8n,
            distributions: [
                {
                    pattern: "admin",
                    weight: 100n,
                    roles: {
                        proposers: 10n,
                        validators: 40n,
                        treasury: 50n
                    }
                },
            ],
            permissions: {
                mint: ['scintilla'],
                burn: ['scintilla'],
            },
            fees: [{type: 'transfer', percent: 2n, max: 20n }],
            metadata: {
                description: 'Scintilla token',
                website: 'https://scintilla.example.com'
            }
        });
        expect(Asset.fromUint8Array(asset.toUint8Array())).toEqual(asset);
        expect(Asset.fromUint8Array(asset.toUint8Array()).toHash()).toEqual(asset.toHash());
        expect(Asset.fromUint8Array(asset.toUint8Array()).toHash()).toEqual('c0e92d2e0aa4c0a48e0fa373ebbd789cb4a2043c5377e8b439049520fd03cc56');
        expect(Asset.fromUint8Array(asset.toUint8Array()).toHex()).toEqual(asset.toHex());

        // expect(Asset.fromUint8Array(asset.toUint8Array())).toEqual(asset);
        // expect(Asset.fromUint8Array(asset.toUint8Array()).toHash()).toEqual(asset.toHash());
        // expect(Asset.fromUint8Array(asset.toUint8Array()).toHex()).toEqual(asset.toHex());
        // expect(Asset.fromUint8Array(customAsset.toUint8Array())).toEqual(customAsset);
        // expect(Asset.fromUint8Array(customAsset.toUint8Array()).toHash()).toEqual(customAsset.toHash());
        // expect(Asset.fromUint8Array(customAsset.toUint8Array()).toHex()).toEqual(customAsset.toHex());
    });
    // TODO
    it.skip('cannot update max supply of asset with immutable supply', () => {
        const asset = new Asset({
            name: 'Scintilla',
            symbol: 'SCT',
            supply: {
                _max: 100_000_000n * 10n ** 8n,
            },
        });

        asset.supply._max = 100_000_000n * 10n ** 9n;

        const expectedJSON = {
            name: 'Scintilla',
            symbol: 'SCT',
            supply: {
                max: 100_000_000n * 10n ** 8n, total: 0n, circulating: 0n,
            },
            decimals: 9n,
            consensus: {
                members: [],
                type: 'QUORUM_PROOF',
                requirements: [],
                distributions: [],
            },
            distributions: [],
            permissions: {
                mint: ['scintilla'],
                burn: ['scintilla'],
            },
            fees: [{type: 'transfer', percent: 2n, max: 20n }],

            metadata: {
            }
        };

        expect(asset.toJSON()).toEqual(expectedJSON);
    });
});
