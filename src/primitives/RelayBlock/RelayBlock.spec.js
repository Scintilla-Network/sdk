import { describe, it, expect, beforeEach } from '@scintilla-network/litest';
import { RelayBlock } from './RelayBlock.js';
import { RelayBlockHeader } from './RelayBlockHeader.js';
import { RelayBlockPayload } from './RelayBlockPayload.js';
import { Wallet } from '@scintilla-network/wallet';
import { Voucher } from '../Voucher/Voucher.js';
import { Transfer } from '../Transfer/Transfer.js';
import { Transaction } from '../Transaction/Transaction.js';
import { Transition } from '../Transition/Transition.js';
import { Identity } from '../Identity/Identity.js';
import { Asset } from '../Asset/Asset.js';
import { Authorization } from '../Authorization/Authorization.js';
import { uint8array } from '@scintilla-network/keys/utils';
import { hex } from '@scintilla-network/keys/utils';

const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
.getAccount(0)
.getPersona('alice')
.getSigner();

describe('RelayBlock', () => {
    it('initializes with default values if no arguments are provided', () => {
        const relayBlock = new RelayBlock();
        expect(relayBlock.kind).toBe('RELAYBLOCK');
        expect(relayBlock.version).toBe(1);
        expect(relayBlock.header).toBeInstanceOf(RelayBlockHeader);
        expect(relayBlock.payload).toBeInstanceOf(RelayBlockPayload);
        expect(relayBlock.authorizations).toEqual([]);
    });

    it('initializes with custom header and payload', () => {
        const relayBlock = new RelayBlock({
            header: {
                epoch: 5,
                timestamp: 1625097600000n,
                previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
                proposer: 'test-proposer',
                merkleRoot: '0000000000000000000000000000000000000000000000000000000000000000'
            },
            payload: {
                actions: [],
                clusters: []
            }
        });

        expect(relayBlock.header.epoch).toBe(5);
        expect(relayBlock.header.timestamp).toBe(1625097600000n);
        expect(relayBlock.header.proposer).toBe('test-proposer');
        expect(relayBlock.payload.actions).toEqual([]);
        expect(relayBlock.payload.clusters).toEqual([]);
    });

    it('initializes with authorizations', () => {
        const relayBlock = new RelayBlock({
            header: {
                proposer: 'test-proposer'
            },
            authorizations: [
                {
                    publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                    signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                    moniker: 'test-proposer'
                }
            ]
        });

        expect(relayBlock.authorizations.length).toBe(1);
        expect(relayBlock.authorizations[0]).toBeInstanceOf(Authorization);
    });

    describe('considerStateAction', () => {
        it('should add a voucher to the payload', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer',
                    timestamp: 1758826328394n
                }
            });

            const voucher = new Voucher({
                asset: 'test-asset',
                inputs: [{ amount: 100n, hash: 'eef32885ce1a0361f87f74e45b0b7026dd08eaabe3993505702e5228f5977ad5' }],
                output: { amount: 100n, recipient: 'test-recipient' },
                timestamp: 1758826328394n,
            });

            expect(relayBlock.payload.actions.length).toBe(0);
            relayBlock.considerStateAction(voucher);
            expect(relayBlock.payload.actions.length).toBe(1);
            expect(relayBlock.payload.actions[0]).toEqual(voucher);
        });

        it('should add a transaction to the payload', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transaction);
            expect(relayBlock.payload.actions.length).toBe(1);
            expect(relayBlock.payload.actions[0]).toEqual(transaction);
        });

        it('should add a transition to the payload', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const transition = new Transition({
                cluster: 'core.identity',
                action: 'CREATE',
                type: 'IDENTITY',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transition);
            expect(relayBlock.payload.actions.length).toBe(1);
            expect(relayBlock.payload.actions[0]).toEqual(transition);
        });

        it('should update merkle root after adding action', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const initialMerkleRoot = relayBlock.header.merkleRoot;

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transaction);
            expect(relayBlock.header.merkleRoot).not.toBe(initialMerkleRoot);
        });

        it('should handle multiple actions', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const transaction1 = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            const transaction2 = new Transaction({
                cluster: 'core.identity',
                action: 'CREATE',
                type: 'IDENTITY',
                timestamp: 1758826328395n,
            });

            relayBlock.considerStateAction(transaction1);
            relayBlock.considerStateAction(transaction2);

            expect(relayBlock.payload.actions.length).toBe(2);
        });

        it('should not add undefined action', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            relayBlock.considerStateAction(undefined);
            expect(relayBlock.payload.actions.length).toBe(0);
        });
    });

    describe('considerCluster', () => {
        it('should add a cluster to the payload', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const clusterMoniker = 'core.banking';
            const clusterHash = '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770';

            relayBlock.considerCluster(clusterMoniker, clusterHash);
            expect(relayBlock.payload.clusters.length).toBe(1);
            expect(relayBlock.payload.clusters[0]).toEqual([clusterMoniker, clusterHash]);
        });

        it('should update merkle root after adding cluster', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const initialMerkleRoot = relayBlock.header.merkleRoot;

            relayBlock.considerCluster('core.banking', '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770');
            expect(relayBlock.header.merkleRoot).not.toBe(initialMerkleRoot);
        });

        it('should not add cluster with undefined values', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            relayBlock.considerCluster(undefined, 'hash');
            expect(relayBlock.payload.clusters.length).toBe(0);

            relayBlock.considerCluster('moniker', undefined);
            expect(relayBlock.payload.clusters.length).toBe(0);
        });
    });

    describe('addAuthorization', () => {
        it('should add an authorization', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const authorization = {
                publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
            };

            relayBlock.addAuthorization(authorization);
            expect(relayBlock.authorizations.length).toBe(1);
        });

        it('should throw error if signature is missing', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const authorization = {
                publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
            };

            expect(() => relayBlock.addAuthorization(authorization)).toThrow('Signature is required for authorization.');
        });
    });

    describe('sign', () => {
        it('should sign the relay block', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            await relayBlock.sign(signer);

            expect(relayBlock.authorizations.length).toBe(1);
            expect(relayBlock.authorizations[0].signature).toBeDefined();
            expect(relayBlock.authorizations[0].publicKey).toBeDefined();
            expect(relayBlock.authorizations[0].moniker).toBe('alice');
        });

        it('should replace existing authorization when signing with same moniker', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            await relayBlock.sign(signer);
            const firstSignature = relayBlock.authorizations[0].signature;

            await relayBlock.sign(signer);
            const secondSignature = relayBlock.authorizations[0].signature;

            expect(relayBlock.authorizations.length).toBe(1);
            expect(firstSignature).toBe(secondSignature);
        });
    });

    describe('verifyAuthorizations', () => {
        it('should verify valid authorizations', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            await relayBlock.sign(signer);

            const isValid = relayBlock.verifyAuthorizations();
            expect(isValid).toBe(true);
        });
    });

    describe('validate', () => {
        it('should return invalid when no authorizations', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            relayBlock.authorizations = null;
            const validation = relayBlock.validate();

            expect(validation.valid).toBe(false);
            expect(validation.error).toBe('Authorizations are required.');
        });

        it('should return invalid when no signed authorizations', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const validation = relayBlock.validate();

            expect(validation.valid).toBe(false);
            expect(validation.error).toBe('At least one authorization with signature is required.');
        });

        it('should return invalid when proposer has not signed', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'bob',
                    timestamp: 1758826328394n
                }
            });

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await relayBlock.sign(signer);

            const validation = relayBlock.validate();

            expect(validation.valid).toBe(false);
            expect(validation.error).toBe('Proposer authorization is required.');
        });

        it('should return invalid when merkle root does not match', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transaction);

                
            // Tamper with merkle root
            relayBlock.header.merkleRoot = '0000000000000000000000000000000000000000000000000000000000000000';
                
            await relayBlock.sign(signer);
            const validation = relayBlock.validate();

            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('Merkle root mismatch');
        });

        it('should return valid for properly signed relay block', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transaction);

            await relayBlock.sign(signer);

            const validation = relayBlock.validate();

            expect(validation.valid).toBe(true);
            expect(validation.error).toBe('');
        });
    });

    describe('isValid', () => {
        it('should return true for valid relay block', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await relayBlock.sign(signer);

            expect(relayBlock.isValid()).toBe(true);
        });

        it('should return false for invalid relay block', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            expect(relayBlock.isValid()).toBe(false);
        });
    });

    describe('updateMerkleRoot', () => {
        it('should update merkle root based on payload', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const initialMerkleRoot = relayBlock.header.merkleRoot;

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.payload.considerStateAction(transaction);
            relayBlock.updateMerkleRoot();

            expect(relayBlock.header.merkleRoot).not.toBe(initialMerkleRoot);
        });
    });

    describe('verifyEntity', () => {
        it('should verify entity is in merkle tree', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transaction);

            const isVerified = relayBlock.verifyEntity(transaction);
            expect(isVerified).toBe(true);
        });

        it('should verify cluster is in merkle tree', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const clusterMoniker = 'core.banking';
            const clusterHash = '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770';

            relayBlock.considerCluster(clusterMoniker, clusterHash);

            const cluster = [clusterMoniker, clusterHash];
            const isVerified = relayBlock.verifyEntity(cluster, true);
            expect(isVerified).toBe(true);
        });

        it('should return false for entity not in merkle tree', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const transaction1 = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            const transaction2 = new Transaction({
                cluster: 'core.identity',
                action: 'CREATE',
                type: 'IDENTITY',
                timestamp: 1758826328395n,
            });

            relayBlock.considerStateAction(transaction1);

            const isVerified = relayBlock.verifyEntity(transaction2);
            expect(isVerified).toBe(false);
        });

        it('should return false when no actions or clusters', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            const isVerified = relayBlock.verifyEntity(transaction);
            expect(isVerified).toBe(false);
        });
    });

    describe('serialization and deserialization', () => {
        it('should serialize to Uint8Array and deserialize back', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    epoch: 1,
                    proposer: 'alice',
                    timestamp: 1758826328394n,
                    previousHash: '0000000000000000000000000000000000000000000000000000000000000000'
                },
                payload: {
                    clusters: [['core.banking', '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770']]
                }
            });

            await relayBlock.sign(signer);

            const uint8Array = relayBlock.toUint8Array();
            const parsed = RelayBlock.fromUint8Array(uint8Array);

            expect(parsed.toHash('hex')).toBe(relayBlock.toHash('hex'));
            expect(parsed.header.epoch).toBe(relayBlock.header.epoch);
            expect(parsed.header.proposer).toBe(relayBlock.header.proposer);
            expect(parsed.payload.clusters).toEqual(relayBlock.payload.clusters);
        });

        it('should handle complex relay block with multiple actions', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const asset = new Asset({
                name: 'Test Token',
                symbol: 'TEST',
                decimals: 18,
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
                data: [asset],
            });

            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const transition = new Transition({
                cluster: 'core.identity',
                action: 'CREATE',
                type: 'IDENTITY',
                timestamp: 1758826328394n,
                data: [identity],
            });

            relayBlock.considerStateAction(transaction);
            relayBlock.considerStateAction(transition);

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await relayBlock.sign(signer);

            const uint8Array = relayBlock.toUint8Array();
            const parsed = RelayBlock.fromUint8Array(uint8Array);

            expect(parsed.toHash('hex')).toBe(relayBlock.toHash('hex'));
            expect(parsed.payload.actions.length).toBe(2);
            expect(parsed.isValid()).toBe(true);
        });

        it('should serialize to hex and deserialize from hex', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await relayBlock.sign(signer);

            const hex = relayBlock.toHex();
            const parsed = RelayBlock.fromHex(hex);

            expect(parsed.toHash('hex')).toBe(relayBlock.toHash('hex'));
        });

        it('should serialize with excludeAuthorizations option', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            await relayBlock.sign(signer);

            const withAuth = relayBlock.toUint8Array({ excludeAuthorizations: false });
            const withoutAuth = relayBlock.toUint8Array({ excludeAuthorizations: true });

            expect(withAuth.length).toBeGreaterThan(withoutAuth.length);
        });
    });

    describe('toJSON and fromJSON', () => {
        it('should convert to JSON and back', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    epoch: 1,
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            await relayBlock.sign(signer);

            const json = relayBlock.toJSON();
            const parsed = RelayBlock.fromJSON(json);

            expect(parsed.header.epoch).toBe(relayBlock.header.epoch);
            expect(parsed.header.proposer).toBe(relayBlock.header.proposer);
        });

        it('should exclude authorizations in JSON when specified', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice'
                },
                authorizations: [{
                    publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                    signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                }]
            });

            const json = relayBlock.toJSON({ excludeAuthorizations: true });
            expect(json.authorizations).toBeUndefined();
        });
    });

    describe('toHash', () => {
        it('should compute hash in hex encoding', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer',
                    timestamp: 1758826328394n
                }
            });

            const hash = relayBlock.toHash('hex');
            expect(typeof hash).toBe('string');
            expect(hash).toMatch(/^[0-9a-f]{64}$/);
        });

        it('should compute hash in uint8array encoding', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer',
                    timestamp: 1758826328394n
                }
            });

            const hash = relayBlock.toHash('uint8array');
            expect(hash).toBeInstanceOf(Uint8Array);
            expect(hash.length).toBe(32);
        });

        it('should compute consistent hash', async () => {
            const relayBlock1 = new RelayBlock({
                header: {
                    epoch: 1,
                    proposer: 'alice',
                    timestamp: 1758826328394n,
                    previousHash: '0000000000000000000000000000000000000000000000000000000000000000'
                }
            });

            const relayBlock2 = new RelayBlock({
                header: {
                    epoch: 1,
                    proposer: 'alice',
                    timestamp: 1758826328394n,
                    previousHash: '0000000000000000000000000000000000000000000000000000000000000000'
                }
            });

            await relayBlock1.sign(signer);
            await relayBlock2.sign(signer);

            expect(relayBlock1.toHash('hex')).toBe(relayBlock2.toHash('hex'));
        });
    });

    describe('toSignableMessage', () => {
        it('should create signable message', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer',
                    timestamp: 1758826328394n
                }
            });

            const signableMessage = relayBlock.toSignableMessage();
            expect(signableMessage).toBeDefined();
        });

        it('should create signable message excluding authorizations', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer',
                    timestamp: 1758826328394n
                },
                authorizations: [{
                    publicKey: '026f14fb89cfec70568fd4dd87311767fb5f73fb1326922d878a1a94a0bf363101',
                    signature: '6b36a907c9115e9f8689d1d6bcdcaab51d750c3e54007d4d960994f96479b04918f7a9f5b66eb9ad44522945e0c556252b1c889208b8f07596370bbf29d43605',
                }]
            });

            const signableMessage = relayBlock.toSignableMessage({ excludeAuthorizations: true });
            expect(signableMessage).toBeDefined();
        });
    });

    describe('edge cases', () => {
        it('should handle empty payload', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                },
                payload: {
                    actions: [],
                    clusters: []
                }
            });

            expect(relayBlock.payload.actions).toEqual([]);
            expect(relayBlock.payload.clusters).toEqual([]);
        });

        it('should handle timestamp updates when adding actions', () => {
            const initialTimestamp = 1758826328394n;
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer',
                    timestamp: initialTimestamp
                }
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transaction);

            // Timestamp should be updated or stay within valid range
            expect(relayBlock.header.timestamp).toBeDefined();
        });

        it('should handle multiple clusters', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            relayBlock.considerCluster('core.banking', '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770');
            relayBlock.considerCluster('core.identity', '03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a');

            expect(relayBlock.payload.clusters.length).toBe(2);
        });

        it('should handle mixed actions and clusters', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transaction);
            relayBlock.considerCluster('core.banking', '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770');

            expect(relayBlock.payload.actions.length).toBe(1);
            expect(relayBlock.payload.clusters.length).toBe(1);
        });
    });

    describe('real-world scenario', () => {
        it('should handle a complete relay block with voucher', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    timestamp: 1758826328394n,
                    proposer: 'alice'
                },
                payload: {
                    clusters: [['core.banking', '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770']]
                },
            });

            const voucher = new Voucher({
                asset: 'test-asset',
                inputs: [{ amount: 100n, hash: 'eef32885ce1a0361f87f74e45b0b7026dd08eaabe3993505702e5228f5977ad5' }],
                output: { amount: 100n, recipient: 'test-recipient' },
                timestamp: 1758826328394n,
                timelock: {
                    startAt: 0n,
                    endAt: 0n
                },
            });

            const voucherSigner = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('bob')
                .getSigner();

            await voucher.sign(voucherSigner);

            relayBlock.considerStateAction(voucher);

            expect(relayBlock.payload.actions.length).toBe(1);
            expect(relayBlock.payload.actions[0]).toEqual(voucher);

            await relayBlock.sign(signer);

            const uint8Array = relayBlock.toUint8Array();
            const parsed = RelayBlock.fromUint8Array(uint8Array);

            expect(parsed.toHash('hex')).toBe(relayBlock.toHash('hex'));
            expect(parsed.isValid()).toBe(true);
        });

        it('should handle relay block with asset creation', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const asset = new Asset({
                name: 'Scintilla Token',
                symbol: 'SCT',
                decimals: 18,
                consensus: {
                    members: [['scintilla', 1000, 0, 0, 0, 0, 0]],
                },
                distributions: [],
                permissions: {
                    burn: ['scintilla'],
                    mint: ['scintilla'],
                },
                fees: [['transfer', { percent: 200n, max: 20n * 10n ** 6n }]],
                supply: {
                    max: 10000000000000000n
                },
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
                data: [asset],
            });

            const txSigner = signer;

            await transaction.sign(txSigner);

            relayBlock.considerStateAction(transaction);

            await relayBlock.sign(signer);

            const uint8Array = relayBlock.toUint8Array();
            const parsed = RelayBlock.fromUint8Array(uint8Array);

            expect(parsed.toHash('hex')).toBe(relayBlock.toHash('hex'));
            expect(parsed.payload.actions.length).toBe(1);
            expect(parsed.isValid()).toBe(true);
        });

        it('should handle relay block with identity creation', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const transition = new Transition({
                cluster: 'core.identity',
                action: 'CREATE',
                type: 'IDENTITY',
                timestamp: 1758826328394n,
                data: [identity],
            });

            const txSigner = signer;

            await transition.sign(txSigner);

            relayBlock.considerStateAction(transition);

            await relayBlock.sign(signer);

            const uint8Array = relayBlock.toUint8Array();
            const parsed = RelayBlock.fromUint8Array(uint8Array);

            expect(parsed.toHash('hex')).toBe(relayBlock.toHash('hex'));
            expect(parsed.payload.actions.length).toBe(1);
            expect(parsed.isValid()).toBe(true);
        });

        it('should handle relay block with multiple different action types', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const asset = new Asset({
                name: 'Test Token',
                symbol: 'TEST',
                decimals: 18,
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
                data: [asset],
            });

            const identity = new Identity({
                moniker: 'test-identity',
                members: [['alice', 1000, 0, 0, 0, 0, 0]],
            });

            const transition = new Transition({
                cluster: 'core.identity',
                action: 'CREATE',
                type: 'IDENTITY',
                timestamp: 1758826328394n,
                data: [identity],
            });

            const transfer = new Transfer({
                cluster: 'core.banking',
                action: 'EXECUTE',
                type: 'ASSET',
                timestamp: 1758826328394n,
                data: [{
                    asset: 'TEST',
                    amount: 10000000000000000n,
                    recipient: 'bob'
                }],
            });

          

            await transaction.sign(signer);
            await transition.sign(signer);
            await transfer.sign(signer);

            relayBlock.considerStateAction(transaction);
            relayBlock.considerStateAction(transition);
            relayBlock.considerStateAction(transfer);

            await relayBlock.sign(signer);

            expect(relayBlock.payload.actions.length).toBe(3);

            const uint8Array = relayBlock.toUint8Array();
            const parsed = RelayBlock.fromUint8Array(uint8Array);

            expect(parsed.toHash('hex')).toBe(relayBlock.toHash('hex'));
            expect(parsed.payload.actions.length).toBe(3);
            expect(parsed.isValid()).toBe(true);
        });
    });

    describe('merkle root verification', () => {
        it('should verify merkle root matches payload', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transaction);

            const computedMerkleRoot = relayBlock.payload.computeMerkleRoot('hex');
            const headerMerkleRoot = relayBlock.header.merkleRoot;

            expect(computedMerkleRoot).toBe(hex.fromUint8Array(headerMerkleRoot));
        });

        it('should update merkle root when payload changes', () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'test-proposer'
                }
            });

            const transaction1 = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transaction1);
            const merkleRoot1 = relayBlock.header.merkleRoot;

            const transaction2 = new Transaction({
                cluster: 'core.identity',
                action: 'CREATE',
                type: 'IDENTITY',
                timestamp: 1758826328395n,
            });

            relayBlock.considerStateAction(transaction2);
            const merkleRoot2 = relayBlock.header.merkleRoot;

            expect(merkleRoot1).not.toBe(merkleRoot2);
        });

        it('should have consistent merkle root across serialization', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const transaction = new Transaction({
                cluster: 'core.banking',
                action: 'CREATE',
                type: 'ASSET',
                timestamp: 1758826328394n,
            });

            relayBlock.considerStateAction(transaction);

            const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                .getAccount(0)
                .getPersona('alice')
                .getSigner();

            await relayBlock.sign(signer);

            const originalMerkleRoot = relayBlock.header.merkleRoot;

            const uint8Array = relayBlock.toUint8Array();
            const parsed = RelayBlock.fromUint8Array(uint8Array);

            expect(hex.fromUint8Array(parsed.header.merkleRoot)).toBe(hex.fromUint8Array(originalMerkleRoot));
            expect(parsed.isValid()).toBe(true);
        });
    });

    describe('authorization scenarios', () => {
        it('should support multiple signers', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const wallet = Wallet.fromMnemonic('test test test test test test test test test test test junk');
            const aliceSigner = wallet.getAccount(0).getPersona('alice').getSigner();
            const bobSigner = wallet.getAccount(1).getPersona('bob').getSigner();

            await relayBlock.sign(aliceSigner);
            await relayBlock.sign(bobSigner);

            expect(relayBlock.authorizations.length).toBe(2);
            expect(relayBlock.verifyAuthorizations()).toBe(true);
        });

        it('should validate with proposer signature present', async () => {
            const relayBlock = new RelayBlock({
                header: {
                    proposer: 'alice',
                    timestamp: 1758826328394n
                }
            });

            const wallet = Wallet.fromMnemonic('test test test test test test test test test test test junk');
            const aliceSigner = wallet.getAccount(0).getPersona('alice').getSigner();
            const bobSigner = wallet.getAccount(1).getPersona('bob').getSigner();

            // Sign with alice first (proposer)
            await relayBlock.sign(aliceSigner);
            await relayBlock.sign(bobSigner);

            const validation = relayBlock.validate();
            expect(validation.valid).toBe(true);
        });
    });
});