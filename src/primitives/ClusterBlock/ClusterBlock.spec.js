// import { describe, it, expect } from 'vitest';
import { describe, it, expect } from '@scintilla-network/litest';
import {ClusterBlock} from './ClusterBlock.js';
import HashProof from '../HashProof/HashProof.js';
import Transfer from '../Transfer/Transfer.js';
import Asset from '../Asset/Asset.js';
import Authorization from '../Authorization/Authorization.js';

describe('ClusterBlock', () => {
    it('should create a cluster block', () => {
        const clusterBlock = new ClusterBlock();
        expect(clusterBlock).toBeDefined();
        
        expect(clusterBlock.header).toBeDefined();
        expect(clusterBlock.header.timestamp).toBeGreaterThan(0);
        expect(clusterBlock.header.height).toBe(0);
        expect(clusterBlock.header.previousHash).toBeNull();
        expect(clusterBlock.header.proposer).toBeNull();
        expect(clusterBlock.header.cluster).toBe('');
        expect(clusterBlock.header.version).toBe(1);

        expect(clusterBlock.payload).toBeDefined();
        expect(clusterBlock.payload.hashProofHashes).toEqual([]);
        expect(clusterBlock.payload.orderedStateActions).toEqual([]);

        expect(clusterBlock.authorizations).toBeDefined();
        expect(clusterBlock.authorizations).toEqual([]);
    });

    it('should consider a state action', () => {
        const clusterBlock = new ClusterBlock({
            header: {
                proposer: 'scintilla',
                timestamp: 1234567890n,
            },
        });

        const hashProof = new HashProof({
            header: {
                cluster: '',
                proposer: 'scintilla',
                timestamp: 1234567890n,
            },
            payload: {
                data: [],
            },
        });


        const transfer = new Transfer({
            timestamp: 1234567890n,
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
        expect(transfer.toHash()).toEqual('58ed461f81e531304b436a0464cdd0a5cbb2500f74422a4564c8f91d9bd1a83e');
        hashProof.consider(transfer);
        expect(hashProof.toHash()).toEqual('ed0a77cb54f353e47346a0318e459d790ca08e592eeef6fc80bbce066913222e');

        clusterBlock.consider(hashProof);

        const parsedClusterBlock = ClusterBlock.fromUint8Array(clusterBlock.toUint8Array());
        expect(parsedClusterBlock.toHash()).toEqual(clusterBlock.toHash());
        expect(parsedClusterBlock.toHash()).toEqual('a7ac8285f4e5fda6694ced1fa3084b133c0b253f79ff36290167e3f364131177');
        expect(parsedClusterBlock.toHex()).toEqual('3b000000010000000000000000499602d2000000000000000000000000000000000000000000000000000000000000000000097363696e74696c6c6151095b224153534554225d465b22303a65643061373763623534663335336534373334366130333138653435396437393063613038653539326565656636666338306262636530363639313332323265225d5b5d');

    });
    

});