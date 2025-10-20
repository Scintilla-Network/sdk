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
        expect(clusterBlock.toHash('hex')).toEqual('ab1ec92d952297b804109dc2cd1a5c93ba9275443d2d73a4bbec8daaf90c2147');
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

        expect(transfer.toHash('hex')).toEqual('91c52797ad20ed55f7df153e1fd45c2503051996d10c30fe79f6df68541fcf6f');
        hashProof.consider(transfer);
        expect(hashProof.toHash('hex')).toEqual('e464d48b9ae9c24a892ac154a7f73cf1722f3c228f1ab3811b7ecaf13e19d8b0');

        clusterBlock.consider(hashProof);

        const parsedClusterBlock = ClusterBlock.fromUint8Array(clusterBlock.toUint8Array());
        expect(parsedClusterBlock.toHash('hex')).toEqual('121c5f2f6c7f91c9f53b2757a170bc7e4124c6257ec6aa11cfe44deb5b6b8709');
        expect(parsedClusterBlock.toHex()).toEqual('06010c636f72652e62616e6b696e673400fd7cb3c5a2990100000000000000000000000000000000000000000000000000000000000000000000097363696e74696c6c6151095b224153534554225d465b22303a65343634643438623961653963323461383932616331353461376637336366313732326633633232386631616233383131623765636166313365313964386230225d0000');
        expect(clusterBlock.toHex()).toEqual('06010c636f72652e62616e6b696e673400fd7cb3c5a2990100000000000000000000000000000000000000000000000000000000000000000000097363696e74696c6c6151095b224153534554225d465b22303a65343634643438623961653963323461383932616331353461376637336366313732326633633232386631616233383131623765636166313365313964386230225d0000');
        expect(parsedClusterBlock.toHash('hex')).toEqual(clusterBlock.toHash('hex'));
        expect(parsedClusterBlock.toHex()).toEqual(clusterBlock.toHex());

    });
    

});