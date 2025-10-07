// import { describe, it, expect } from 'vitest';
import { describe, it, expect } from '@scintilla-network/litest';
import {ClusterBlock} from './ClusterBlock.js';
import HashProof from '../HashProof/HashProof.js';
import Transfer from '../Transfer/Transfer.js';
import Asset from '../Asset/Asset.js';
import Authorization from '../Authorization/Authorization.js';

describe('ClusterBlock', () => {
    it('should create a cluster block', () => {
        const clusterBlock = new ClusterBlock({
            cluster: 'core.banking',
            header: {
                proposer: 'scintilla',
                timestamp: 1759372489596n,
                height: 0n,
                previousHash: null,
            },
        });
        expect(clusterBlock.toHash()).toEqual('213912ec3f77053de0d730767293dd821c82d6aa0113505f8766b897efd2d7ad');
    });
    it('should create a cluster block', () => {
        const clusterBlock = new ClusterBlock();
        expect(clusterBlock).toBeDefined();
        
        expect(clusterBlock.header).toBeDefined();
        expect(clusterBlock.version).toBe(1);
        expect(clusterBlock.cluster).toBe('');
        expect(Number(clusterBlock.header.timestamp)).toBeGreaterThan(0);
        expect(clusterBlock.header.height).toBe(0);
        expect(clusterBlock.header.previousHash).toEqual(new Uint8Array(32).fill(0));
        expect(clusterBlock.header.proposer).toBe('');

        expect(clusterBlock.payload).toBeDefined();
        expect(clusterBlock.payload.hashProofHashes).toEqual([]);
        expect(clusterBlock.payload.orderedStateActions).toEqual([]);

        expect(clusterBlock.authorizations).toBeDefined();
        expect(clusterBlock.authorizations).toEqual([]);
    });

    it('should consider a state action', () => {
        const clusterBlock = new ClusterBlock({
            cluster: 'core.banking',
            header: {
                proposer: 'scintilla',
                timestamp: 1759372489596n,
            },
        });

        const hashProof = new HashProof({
            cluster: 'core.banking',
            header: {
                proposer: 'scintilla',
                timestamp: 1759372489596n,
            },
            payload: {
                data: [],
            },
        });


        const transfer = new Transfer({
            timestamp: 1759372489596n,
            cluster: 'core.banking',
            action: 'EXECUTE',
            type: 'ASSET',
            data: [new Asset({
                name: 'Scintilla',
                symbol: 'SCT',
                supply: {
                    max: 10000000000000000n,
                    total: 0n,
                    circulating: 0n,
                },
            })],
            authorizations:[
                new Authorization({
                    signature: '95f72d0b5f2533bbd292be7e6b7f0439598e941216452ae2945535fd523ed17152fa6aa6448a385835f3a4440b14f5d7dbdb24c63659cae7dc2208a5d9b415b6',
                    publicKey: '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770',
                    address: 'sct17myx4f5gd9wsptkeqgw8xft2rtdkakkc6tcsug',
                    moniker: 'alice'
                }),
                new Authorization({
                    signature: '500775d65ce45a4209fb584e6d16205b69e7e26fe84022ef455b90a5a8ab5914412cc87d7b6143991483b3bd3f71cf8bb89b055b2a3c6083046959af5eb9c2bd',
                    publicKey: '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770',
                    address: 'sct17myx4f5gd9wsptkeqgw8xft2rtdkakkc6tcsug',
                    moniker: 'bob'
                }),
            ],
            fees: [{
                amount: 1000,
                asset: 'SCT',
                payer: 'alex',
            }],
        });

        expect(transfer.toHash()).toEqual('d1ee52fb90bc9878c4f95ac02476c2bdfc234c6e83a4b1b6e2c95095ba3e547f');
        hashProof.consider(transfer);
        expect(hashProof.toHash()).toEqual('79169b6e9af3dd1c594e8cc1aa20041ca7a1d8b658bf61b2d705bd78f515d1d2');

        clusterBlock.consider(hashProof);

        const parsedClusterBlock = ClusterBlock.fromUint8Array(clusterBlock.toUint8Array());
        expect(parsedClusterBlock.toHash()).toEqual('9a93c7384e9e11392166d326220b0ca1812aa49285b5e5877151492a937076d9');
        expect(parsedClusterBlock.toHex()).toEqual('06010c636f72652e62616e6b696e673400fd7cb3c5a2990100000000000000000000000000000000000000000000000000000000000000000000097363696e74696c6c6151095b224153534554225d465b22303a37393136396236653961663364643163353934653863633161613230303431636137613164386236353862663631623264373035626437386635313564316432225d0000');
        expect(clusterBlock.toHex()).toEqual('06010c636f72652e62616e6b696e673400fd7cb3c5a2990100000000000000000000000000000000000000000000000000000000000000000000097363696e74696c6c6151095b224153534554225d465b22303a37393136396236653961663364643163353934653863633161613230303431636137613164386236353862663631623264373035626437386635313564316432225d0000');
        expect(parsedClusterBlock.toHash()).toEqual(clusterBlock.toHash());
        expect(parsedClusterBlock.toHex()).toEqual(clusterBlock.toHex());

    });
    

});