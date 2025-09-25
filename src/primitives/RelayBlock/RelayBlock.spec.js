// import { describe, it, expect, beforeEach } from 'vitest';
import { describe, it, expect, beforeEach } from '@scintilla-network/litest';
import { RelayBlock } from './RelayBlock.js';
import { RelayBlockHeader } from './RelayBlockHeader.js';
import { RelayBlockPayload } from './RelayBlockPayload.js';
import { uint8array, varbigint, json } from '@scintilla-network/keys/utils';

import { Voucher } from '../Voucher/Voucher.js';
import { Transfer } from '../Transfer/Transfer.js';
import { Transaction } from '../Transaction/Transaction.js';
import { Transition } from '../Transition/Transition.js';
import { Identity } from '../Identity/Identity.js';
import { Asset } from '../Asset/Asset.js';

describe.only('RelayBlock', () => {
  it('should create a RelayBlock instance', async () => {
    const relayBlock = new RelayBlock({
      header: {
        timestamp: '2025-01-01T00:00:00.000Z',
        proposer: 'test-proposer'
      },
      payload:{
        clusters: [['core.banking', '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770']]
      },
    });
    expect(relayBlock).toBeInstanceOf(RelayBlock);
    expect(relayBlock.header).toBeInstanceOf(RelayBlockHeader);
    expect(relayBlock.payload).toBeInstanceOf(RelayBlockPayload);
    // expect(relayBlock.signatures).toEqual([]);

    /**
     * signer
     */
    // {
    //   moniker: 'test-moniker',
    //   getMoniker: () => 'test-moniker',
    //   privateKey: uint8array.fromHex('337adff26342dfbf2bf140532ebd1c77fcd5a23a520a07a83fb78969821070b3')
    // }
    const voucher = new Voucher({
      asset: 'test-asset',
      inputs: [{ amount: 100n, hash: 'eef32885ce1a0361f87f74e45b0b7026dd08eaabe3993505702e5228f5977ad5' }],
      output: { amount: 100n, recipient: 'test-recipient' },
      timestamp: 1758826328394n,
      timelock: {
        startAt: 0n,
        endAt: 0n
      },
      authorizations: [{
            signature: '95f72d0b5f2533bbd292be7e6b7f0439598e941216452ae2945535fd523ed17152fa6aa6448a385835f3a4440b14f5d7dbdb24c63659cae7dc2208a5d9b415b6',
            publicKey: '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770',
            address: 'sct17myx4f5gd9wsptkeqgw8xft2rtdkakkc6tcsug',
            moniker: 'test-moniker'
      }]
    });
    expect(voucher.toHash()).to.equal('cf82495d4cac1aea54c04c0840d0e6107cec7e632f88f63a446af4b9efedd147')
    expect(voucher.toHex()).to.equal('1001fd4af13782990100000a746573742d6173736574016420eef32885ce1a0361f87f74e45b0b7026dd08eaabe3993505702e5228f5977ad5640e746573742d726563697069656e7400000000010f4095f72d0b5f2533bbd292be7e6b7f0439598e941216452ae2945535fd523ed17152fa6aa6448a385835f3a4440b14f5d7dbdb24c63659cae7dc2208a5d9b415b62102b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e87700c746573742d6d6f6e696b65722a73637431376d7978346635676439777370746b6571677738786674327274646b616b6b63367463737567')
    relayBlock.considerStateAction(voucher);
    // relayBlock.considerStateAction(voucher);

    // console.log(relayBlock.toHex());

    const asset = new Asset({
      name: 'Scintilla Token',
      symbol: 'SCT',
      decimals: 18,
      consensus: {
        members: [['scintilla', 1000, 0, 0, 0, 0, 0]],
        
      },
      distributions:[],
      permissions:{
        burn: ['scintilla'],
        mint: ['scintilla'],
      },
      fees:[['transfer', { percent: 200n, max: 20n * 10n ** 6n }]],
      supply: {
        max: 10000000000000000n
      },
    });

    // console.log('asset', Asset.fromUint8Array(asset.toUint8Array()));
    // return;

    const transaction = new Transaction({
      cluster: 'core.banking',
      action: 'CREATE',
      type: 'ASSET',
      timestamp: 1758826328394n,
      data: [asset],
    });
// 
    relayBlock.considerStateAction(transaction);

    const identity = new Identity({
      moniker: 'test-moniker',
      members: [['scintilla', 1000, 0, 0, 0, 0, 0]],
    });
    const transaction2 = new Transaction({
      cluster: 'core.identity',
      action: 'CREATE',
      type: 'IDENTITY',
      timestamp: 1758826328394n,
      data: [identity],
    });
// 
    relayBlock.considerStateAction(transaction2);
   


    // const transfer = new Transfer({
    //   timestamp: 1234567890,
    //   cluster: 'core.banking',
    //   action: 'EXECUTE',
    //   type: 'ASSET',
    //   data: [{
    //     asset: 'SCT',
    //     amount: 10000000000000000,
    //     recipient: 'test-recipient'
    //   }],  
    //   authorizations: [{
    //     signature: '95f72d0b5f2533bbd292be7e6b7f0439598e941216452ae2945535fd523ed17152fa6aa6448a385835f3a4440b14f5d7dbdb24c63659cae7dc2208a5d9b415b6',
    //     publicKey: '02b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770',
    //     address: 'sct17myx4f5gd9wsptkeqgw8xft2rtdkakkc6tcsug',
    //     moniker: 'test-moniker'
    //   }]
    // });
    // relayBlock.considerStateAction(transfer);

    const hash = relayBlock.toHash();
    expect(hash).toEqual('fe91edb91e0c8e5fa782f3d56110022ce09d2f6356f909af80c4c43f70a83d49');
    const hex = relayBlock.toHex();
    expect(hex).toEqual("0000003a00000000000001941f297c0000000000000000000000000000000000000000000000000000000000000000000d746573742d70726f706f7365720000029703ea1001fd4af13782990100000a746573742d6173736574016420eef32885ce1a0361f87f74e45b0b7026dd08eaabe3993505702e5228f5977ad5640e746573742d726563697069656e7400000000010f4095f72d0b5f2533bbd292be7e6b7f0439598e941216452ae2945535fd523ed17152fa6aa6448a385835f3a4440b14f5d7dbdb24c63659cae7dc2208a5d9b415b62102b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e87700c746573742d6d6f6e696b65722a73637431376d7978346635676439777370746b6571677738786674327274646b616b6b63367463737567f808010c636f72652e62616e6b696e670643524541544505415353455401af110f5363696e74696c6c6120546f6b656e03534354fd0000c16ff28623000000122a7b226d656d62657273223a5b5b227363696e74696c6c61222c313030302c302c302c302c302c305d5d7d025b5d2b7b226275726e223a5b227363696e74696c6c61225d2c226d696e74223a5b227363696e74696c6c61225d7d012f5b227472616e73666572222c7b2270657263656e74223a22323030222c226d6178223a223230303030303030227d5d027b7dfd4af1378299010000001f7b2273746172745469636b223a2230222c22656e645469636b223a2230227d008108010d636f72652e6964656e7469747906435245415445084944454e54495459013412037363740c746573742d6d6f6e696b6572027b7d1e5b5b227363696e74696c6c61222c313030302c302c302c302c302c305d5dfd4af1378299010000001f7b2273746172745469636b223a2230222c22656e645469636b223a2230227d00010c636f72652e62616e6b696e674202b045328af927f6537b9336a4f1a770a2147a546b4e77dbe41198967afb4e8770000000025b5d");
    const array = relayBlock.toUint8Array();
    const parsedRelayBlock = RelayBlock.fromUint8Array(array);
    expect(json.stringify(parsedRelayBlock.toJSON())).toEqual(json.stringify(relayBlock.toJSON()));
    // expect(parsedRelayBlock.toHash()).toEqual(relayBlock.toHash());
    // expect(parsedRelayBlock.toHex()).toEqual(relayBlock.toHex());
    // expect(parsedRelayBlock.toHash()).toEqual(relayBlock.toHash());
    // expect(parsedRelayBlock.toHex()).toEqual(relayBlock.toHex());
    // expect(parsedRelayBlock.toHash()).toEqual(relayBlock.toHash());
    // console.log(parsedRelayBlock.toHash());
    // console.log(relayBlock.toHash());
    // expect(parsedRelayBlock.toHex()).toEqual(relayBlock.toHex());

    // console.log(voucher);

    // const array = voucher.toUint8Array();
    // console.log(array);
    // const hex = uint8array.toHex(array);
    // console.log(hex);
    // const hexArray = uint8array.fromHex(hex);
    // console.log(hexArray);
    // const parsed = Voucher.fromUint8Array(array);
    // console.log(parsed.toJSON());
    // console.log(Voucher.fromUint8Array(voucher.toUint8Array()));
    // console.dir({voucher}, { depth: null });
    // relayBlock.considerStateAction(voucher);
    // const relayBlockHash = relayBlock.toHash();
    // console.log(relayBlockHash);
    // console.log(relayBlock);
    // const parsedRelayBlock = RelayBlock.fromUint8Array(relayBlock.toUint8Array());
    // console.log(parsedRelayBlock.toHash());
    // console.log('ParsedRelayBlock.toHash() === relayBlockHash', parsedRelayBlock.toHash() === relayBlockHash);
    // console.log('ParsedRelayBlock.toHash()', parsedRelayBlock.toHash());
    // console.log('relayBlockHash', relayBlockHash);
    // console.dir({parsedRelayBlock}, { depth: null });

    // console.log(voucher.toHex());
    // relayBlock.considerStateAction(voucher);

    // console.log(relayBlock.payload.actions);
    // console.log(relayBlock.payload.actions);
    // console.log(uint8array.toHex(relayBlock.payload.actions[0]));
    // expect(relayBlock.payload.actions[0]).toEqual(uint8array.fromHex('10010a746573742d61737365740164000000000000000000000a00640e746573742d726563697069656e7400000000fdc490c77f90010000010707000000000000000800000000000c00000c746573742d6d6f6e696b6572'));

    // expect(relayBlock.toHash()).toEqual('788500ef275350f41d4977bab1f5c325776ca61472c782193c3307ad7c5be25b');

    // const parsed = RelayBlock.fromUint8Array(relayBlock.toUint8Array());
    // expect(parsed.payload.actions[0]).toEqual(relayBlock.payload.actions[0]);
    // expect(parsed.toHash()).toEqual(relayBlock.toHash());
  });
});

// describe('RelayBlock', () => {
//   let relayBlock;


//   beforeEach(() => {
//     relayBlock = new RelayBlock();
//   });
//   describe.only('Process, parse, and validate RelayBlock', () => {
//     it('should create a RelayBlock instance', () => {
//       const relayBlock = new RelayBlock();
//       expect(relayBlock).toBeInstanceOf(RelayBlock);
//     });
//   });


//   it('should create a RelayBlock instance', () => {
//     expect(relayBlock).toBeInstanceOf(RelayBlock);
//     expect(relayBlock.header).toBeInstanceOf(RelayBlockHeader);
//     expect(relayBlock.payload).toBeInstanceOf(RelayBlockPayload);
//     expect(relayBlock.signatures).toEqual([]);
//   });

//   it('should consider a state action', () => {
//     const stateAction = { type: 'TEST_ACTION', data: 'test data' };
//     relayBlock.considerStateAction(stateAction);
//     expect(relayBlock.payload.actions).toContainEqual(stateAction);
//   });

//   it('should consider a cluster', () => {
//     const clusterMoniker = 'testCluster';
//     const clusterHash = 'testHash123';
//     relayBlock.considerCluster(clusterMoniker, clusterHash);
//     expect(relayBlock.payload.clusters[clusterMoniker]).toBe(clusterHash);
//   });

//   it('should throw an error when adding an empty signature', () => {
//     const emptySignature = {
//       signature: '',
//       publicKey: 'testPublicKey123',
//     };
//     expect(() => relayBlock.addSignature(emptySignature)).toThrow('Signature is required for authorization.');
//   });

//   it('should convert to and from buffer', () => {
//     const originalBlock = new RelayBlock({
//       header: { epoch: 1, timestamp: new Date(), previousHash: '0c7465737450726f706f7365720c7465737450726f706f7365720c7465737450', proposer: 'testProposer' },
//       payload: { actions: [{ type: 'TEST_ACTION', data: 'test data' }], clusters: { testCluster: 'testHash123' } },
//     });

//     const buffer = originalBlock.toBuffer();
//     const reconstructedBlock = RelayBlock.fromBuffer(buffer);

//     expect(reconstructedBlock.header.epoch).toBe(originalBlock.header.epoch);
//     expect(reconstructedBlock.header.previousHash).toBe(originalBlock.header.previousHash);
//     expect(reconstructedBlock.header.proposer).toBe(originalBlock.header.proposer);
//     expect(reconstructedBlock.payload.actions).toEqual(originalBlock.payload.actions);
//     expect(reconstructedBlock.payload.clusters).toEqual(originalBlock.payload.clusters);
//     expect(reconstructedBlock.signatures).toEqual(originalBlock.signatures);
//   });

//   it('should validate a valid RelayBlock', () => {
//     // const validBlock = new RelayBlock({
        
//     // });
//     // const result = validBlock.validate();
//     // expect(result.valid).toBe(true);
//     // expect(result.error).toBe('');
//   });

//   it('should invalidate a RelayBlock without signatures', () => {
//     const invalidBlock = new RelayBlock();
//     const result = invalidBlock.validate();
//     expect(result.valid).toBe(false);
//     expect(result.error).toBe('At least one authorization with signature is required.');
//   });
// });



// /**
//  * 
//  * TODO: Parse below, ensure it parse also to Transition / Transaction (not just Object)
//  * 
//  * 
//  */

// // {
// //   "header": {
// //     "timestamp": "2024-12-01T02:36:03.749Z",
// //     "epoch": 0,
// //     "previousHash": null,
// //     "proposer": "sct.yggdrasil"
// //   },
// //   "payload": {
// //     "actions": [
// //       {
// //         "version": 1,
// //         "kind": "TRANSITION",
// //         "cluster": "core.identity",
// //         "action": "CREATE",
// //         "type": "IDENTITY",
// //         "data": {
// //           "parent": null,
// //           "moniker": "scintilla",
// //           "members": [
// //             [
// //               "core",
// //               1000, 1000, 0, 0, 0, 0]
// //           ],
// //           "records": {
// //             "clusters": {
// //               "core.identity": {
// //                 "actions": {
// //                   "PROPOSAL_CREATE": [
// //                     {
// //                       "condition": {
// //                         "all": [
// //                           {
// //                             "fact": "identity#parent",
// //                             "operator": "IN",
// //                             "value": [
// //                               "sct",
// //                               "core",
// //                               "scintilla"
// //                             ]
// //                           }
// //                         ],
// //                         "type": "ALLOW"
// //                       },
// //                       "type": "ALLOW"
// //                     }
// //                   ]
// //                 }
// //               },
// //               "scintilla": {
// //                 "consensus": {
// //                   "members": [
// //                     [
// //                       "sct.yggdrasil",
// //                       1000]
// //                   ],
// //                   "type": "QUORUM_PROOF",
// //                   "requirements": [
// //                     {
// //                       "type": "LOCK",
// //                       "amount": 100000000000,
// //                       "asset": "sct"
// //                     }
// //                   ],
// //                   "cycle": "*/10 * * * *",
// //                   "distributions": [
// //                     {
// //                       "pattern": "scintilla",
// //                       "weight": 20,
// //                       "roles": {
// //                         "proposers": 10,
// //                         "validators": 40,
// //                         "treasury": 50
// //                       }
// //                     },
// //                     {
// //                       "pattern": "core.*",
// //                       "weight": 40,
// //                       "roles": {
// //                         "validators": 50,
// //                         "relayers": 10,
// //                         "miners": 35,
// //                         "proposers": 4,
// //                         "treasury": 1
// //                       }
// //                     },
// //                     {
// //                       "pattern": "*",
// //                       "weight": 40,
// //                       "roles": {
// //                         "relayers": 20,
// //                         "miners": 40,
// //                         "validators": 40
// //                       }
// //                     }
// //                   ]
// //                 }
// //               }
// //             }
// //           }
// //         },
// //         "timestamp": 1725000000000,
// //         "fees": [],
// //         "authorizations": [
// //           {
// //             "signature": "ccef20f6705e13e6067a1b40f28a2758d13f7aedfabb9e0e76fa7402a15b18114e302c459602eda5e3266fb6da15f56eca9ac6e2e755a6cb8e1823b656783352",
// //             "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //             "moniker": "sct.yggdrasil"
// //           }
// //         ]
// //       },
// //       {
// //         "version": 1,
// //         "kind": "TRANSITION",
// //         "cluster": "core.identity",
// //         "action": "CREATE",
// //         "type": "IDENTITY",
// //         "data": {
// //           "parent": "sct",
// //           "moniker": "yggdrasil",
// //           "members": [
// //             [
// //               "sct16r5ed3h8k794luyzp2ht096429c0ku6trvq2x8",
// //               1000, 0, 0, 0, 0, 0]
// //           ],
// //           "records": {
// //             "clusters": {
// //               "scintilla": {
// //                 "relayer": {
// //                   "agent": "relayersd-0.1.0",
// //                   "type": "relayer",
// //                   "version": "0.1.0",
// //                   "network": {
// //                     "http": {
// //                       "host": "2a02:842a:299:c01:51e4:959f:941:7970",
// //                       "port": 8887
// //                     },
// //                     "tcp": {
// //                       "host": "2a02:842a:299:c01:51e4:959f:941:7970",
// //                       "port": 8888
// //                     }
// //                   }
// //                 }
// //               }
// //             }
// //           }
// //         },
// //         "timestamp": 1725000000000,
// //         "fees": [],
// //         "authorizations": [
// //           {
// //             "signature": "77441da3053e7e1a3fe8721a293b6d1fe11469c7613df36fc78c5203394ce9cd627c49a1e850f2a02b0f65e6bedfed57d48f110b9b6873f7a4ae0904a5fc1656",
// //             "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //             "moniker": "sct.yggdrasil"
// //           }
// //         ]
// //       },
// //       {
// //         "version": 1,
// //         "kind": "TRANSITION",
// //         "cluster": "core.banking",
// //         "action": "CREATE",
// //         "type": "ASSET",
// //         "data": {
// //           "name": "Scintilla Token",
// //           "symbol": "SCT",
// //           "supply": {
// //             "max": 10000000000000000
// //           },
// //           "decimals": 8,
// //           "distribution": {

// //           },
// //           "permissions": {
// //             "mint": [
// //               "scintilla"
// //             ],
// //             "burn": [
// //               "scintilla"
// //             ]
// //           },
// //           "fees": {
// //             "transfer": {
// //               "percent": 0.00002,
// //               "max": 20
// //             }
// //           },
// //           "metadata": {

// //           }
// //         },
// //         "timestamp": 1733020563801,
// //         "fees": [],
// //         "authorizations": [
// //           {
// //             "signature": "a405f6336e768476d01d5a12e68e7ea20204931c090ec3857140aafe6926d22b1069aabfaaa714c2c1cd08c438c571a3d2b04c28545971a8fb52c59a92c30f77",
// //             "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //             "moniker": "sct.yggdrasil"
// //           }
// //         ]
// //       },
// //       {
// //         "version": 1,
// //         "kind": "TRANSACTION",
// //         "cluster": "core.banking",
// //         "action": "MINT",
// //         "type": "ASSET",
// //         "data": {
// //           "asset": "SCT",
// //           "amount": 100000000000,
// //           "recipient": "scintilla"
// //         },
// //         "timestamp": 1733020563804,
// //         "fees": [],
// //         "timelock": {
// //           "startTick": 0,
// //           "endTick": 0
// //         },
// //         "authorizations": [
// //           {
// //             "signature": "68a99f0a2fb35fe47d02ca9d717efdc4681e9a526b164812e27528c452d00bf14696cd56dbeaab181cfc30387acda4b6ba45ff4ee66197dddd41c2efd6f5fd8b",
// //             "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //             "moniker": "sct.yggdrasil"
// //           }
// //         ]
// //       },
// //       {
// //         "version": 1,
// //         "kind": "TRANSACTION",
// //         "cluster": "core.banking",
// //         "action": "CREATE",
// //         "type": "VOUCHER",
// //         "data": {
// //           "asset": "sct",
// //           "inputs": [
// //             {
// //               "moniker": "scintilla",
// //               "amount": "100000000000"
// //             }
// //           ],
// //           "output": {
// //             "amount": "100000000000",
// //             "recipient": "sct.yggdrasil"
// //           },
// //           "stack": [],
// //           "data": {
// //             "description": "Founders airdrop"
// //           },
// //           "timelock": {
// //             "startAt": "0",
// //             "endAt": "0",
// //             "createdAt": "1733020563806"
// //           },
// //           "authorizations": [
// //             {
// //               "signature": "beb7caa2276f4a89aeeeae1c96b6fcf81cb691063ead26138a33440fcd0c9f97268a3abef928698698d70891714d0f215b9b21c8046b565501eb366a5997e732",
// //               "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //               "moniker": "sct.yggdrasil"
// //             }
// //           ]
// //         },
// //         "timestamp": 1733020563808,
// //         "fees": [],
// //         "timelock": {
// //           "startTick": 0,
// //           "endTick": 0
// //         },
// //         "authorizations": [
// //           {
// //             "signature": "eb6ac1f1954ea6ab715cfdf9cd3cb51b45a95c8e25f4723ed512599a123f77ec55ce488310855b1d19b7bcc2893935261aa8bd5ee9cecc68b83816d0b4daaf91",
// //             "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //             "moniker": "sct.yggdrasil"
// //           }
// //         ]
// //       },
// //       {
// //         "version": 1,
// //         "kind": "TRANSACTION",
// //         "cluster": "core.banking",
// //         "action": "TRANSFER",
// //         "type": "VOUCHER",
// //         "data": {
// //           "asset": "sct",
// //           "inputs": [
// //             {
// //               "hash": "866f4fdfeab5cccda89a60013019d4d3e6492a0595849bcb88bb85681cca97dc",
// //               "amount": "100000000000"
// //             }
// //           ],
// //           "output": {
// //             "amount": "100000000000",
// //             "recipient": "scintilla"
// //           },
// //           "stack": [],
// //           "data": [
// //             {
// //               "description": "Stake to the relayer quorum",
// //               "moniker": "sct.yggdrasil"
// //             }
// //           ],
// //           "timelock": {
// //             "startAt": "0",
// //             "endAt": "0",
// //             "createdAt": "1733020563830"
// //           },
// //           "authorizations": [
// //             {
// //               "signature": "9c63fedf8014a34460579f37d52c5f62a2a71c2c98b351c3f83e4c9c23574a9765eb6278754d22c0023fd41cbfa300b9388c10ffde455245e739e09898747be6",
// //               "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //               "moniker": "sct.yggdrasil"
// //             }
// //           ]
// //         },
// //         "timestamp": 1733020563831,
// //         "fees": [],
// //         "timelock": {
// //           "startTick": 0,
// //           "endTick": 0
// //         },
// //         "authorizations": [
// //           {
// //             "signature": "a279746f4feef57685bf29b3b5eca467dfe4e77fb9dcbd363755e2b9aef4583300cd621d6550c1c5f115a214cf4cb814d8c12767cfc09c1680d108a44dcfb2c6",
// //             "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //             "moniker": "sct.yggdrasil"
// //           }
// //         ]
// //       },
// //       {
// //         "version": 1,
// //         "kind": "TRANSACTION",
// //         "cluster": "scintilla",
// //         "action": "STAKE",
// //         "type": "VOUCHER",
// //         "data": {
// //           "hash": "6a80be507487aa6a3d390c45440e80d1baa5762c9a375d62b5753b55eb4735ea",
// //           "amount": 100000000000,
// //           "asset": "SCT"
// //         },
// //         "timestamp": 1733020563840,
// //         "fees": [],
// //         "timelock": {
// //           "startTick": 0,
// //           "endTick": 0
// //         },
// //         "authorizations": [
// //           {
// //             "signature": "9115702c64d9d33bb4bf7e73b0f9da70e636bcc4c224b25160df4b9e21baeaa0094f4f2d4975ea3a2369ccb2a5bae2fbe79b5693a6ce6ebea424f5058ab7d5dd",
// //             "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //             "moniker": "sct.yggdrasil"
// //           }
// //         ]
// //       },
// //       {
// //         "version": 1,
// //         "kind": "TRANSACTION",
// //         "cluster": "scintilla",
// //         "action": "JOIN",
// //         "type": "QUORUM",
// //         "data": {
// //           "quorum": "scintilla",
// //           "identity": {
// //             "parent": "sct",
// //             "moniker": "yggdrasil",
// //             "members": [
// //               [
// //                 "sct16r5ed3h8k794luyzp2ht096429c0ku6trvq2x8",
// //                 1000, 0, 0, 0, 0, 0]
// //             ],
// //             "records": {
// //               "clusters": {
// //                 "scintilla": {
// //                   "relayer": {
// //                     "agent": "relayersd-0.1.0",
// //                     "type": "relayer",
// //                     "version": "0.1.0",
// //                     "network": {
// //                       "http": {
// //                         "host": "2a02:842a:299:c01:51e4:959f:941:7970",
// //                         "port": 8887
// //                       },
// //                       "tcp": {
// //                         "host": "2a02:842a:299:c01:51e4:959f:941:7970",
// //                         "port": 8888
// //                       }
// //                     }
// //                   }
// //                 }
// //               }
// //             }
// //           }
// //         },
// //         "timestamp": 1733020563843,
// //         "fees": [],
// //         "timelock": {
// //           "startTick": 0,
// //           "endTick": 0
// //         },
// //         "authorizations": [
// //           {
// //             "signature": "b6f5b5fc946b1a9e482ebfa8cfd0c65e658d3123001dc35791d1574c7b13e1a13b39d39f9317176727d760312cecbcda188350a879ecf2d6be9951b865830d39",
// //             "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //             "moniker": "sct.yggdrasil"
// //           }
// //         ]
// //       },
// //       {
// //         "version": 1,
// //         "kind": "TRANSACTION",
// //         "cluster": "core.banking",
// //         "action": "MINT",
// //         "type": "ASSET",
// //         "data": {
// //           "asset": "SCT",
// //           "amount": 25000000000,
// //           "recipient": "scintilla"
// //         },
// //         "timestamp": 1733020563853,
// //         "fees": [],
// //         "timelock": {
// //           "startTick": 0,
// //           "endTick": 0
// //         },
// //         "authorizations": [
// //           {
// //             "signature": "a334cc229dc6e9888d9c8d3c317f062ae1b26795520c5c93d540bef710c3f5d64c32a8d721fa734a5142766c9b59224355e17ede95a25c08b656ad4447a824a6",
// //             "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //             "moniker": "sct.yggdrasil"
// //           }
// //         ]
// //       },
// //       {
// //         "version": 1,
// //         "kind": "TRANSACTION",
// //         "cluster": "core.banking",
// //         "action": "CREATE",
// //         "type": "VOUCHER",
// //         "data": {
// //           "asset": "sct",
// //           "inputs": [
// //             {
// //               "moniker": "scintilla",
// //               "amount": "11900000000"
// //             }
// //           ],
// //           "output": {
// //             "amount": "11900000000",
// //             "recipient": "sct.yggdrasil"
// //           },
// //           "stack": [],
// //           "data": [
// //             {
// //               "description": "Participation reward"
// //             }
// //           ],
// //           "timelock": {
// //             "startAt": "0",
// //             "endAt": "0",
// //             "createdAt": "1733020563853"
// //           },
// //           "authorizations": []
// //         },
// //         "timestamp": 1733020563853,
// //         "fees": [],
// //         "timelock": {
// //           "startTick": 0,
// //           "endTick": 0
// //         },
// //         "authorizations": [
// //           {
// //             "signature": "27a2db4edffdfdf0e3d0cb06a4231c5e80b5dfa58701a3be23a3b49a33dc8b030efa3c750c9f4a626ac4759fa6ffec9927d927e003eca4abf4ebde7130c8b8a4",
// //             "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //             "moniker": "sct.yggdrasil"
// //           }
// //         ]
// //       }
// //     ],
// //     "clusters": {

// //     }
// //   },
// //   "signatures": [
// //     {
// //       "signature": "b113580cdd1d798484c61c72d35b72033c4d081f5a5f3e4888fb75042e9ac0fe2ea26108ab4c6ef08b003464e7444957dcc0458146d5b5c2c0424bdd15a62184",
// //       "publicKey": "03c4d0a96417799dcfba77d2c0462aecf645058950ee8de0a58e98a469f734a59a",
// //       "moniker": "sct.yggdrasil"
// //     }
// //   ]
// // }