import { describe, it, expect } from '@scintilla-network/litest';
import { sha256 } from "@scintilla-network/hashes/classic";
import {secp256k1} from '@scintilla-network/signatures/classic';
import QuorumDecision from './QuorumDecision.js';
import { uint8array } from '@scintilla-network/keys/utils';

describe('QuorumDecision', () => {
    const privateKey = Buffer.from('1e99423a4ed27608a15a2616df64c2d505c4d12db36e7106de5f9e422c41f489', 'hex');
    const publicKey = Buffer.from(secp256k1.getPublicKey(privateKey)).toString('hex');

    it('should create a QuorumDecision', () => {
        const decision = new QuorumDecision({
            proposer: 'proposer1',
            cluster: 'cluster1',
            quorum: 'quorum1',
            payload: [ { data: 'test' } ],
            action: 'ADD_MEMBER',
        });

        expect(decision).toBeDefined();
        expect(decision.proposer).toBe('proposer1');
        expect(decision.cluster).toBe('cluster1');
        expect(decision.quorum).toBe('quorum1');
        expect(decision.payload).toEqual([ { data: 'test' } ]);
        expect(decision.action).toBe('ADD_MEMBER');
        expect(decision.timestamp).toBeDefined();
        expect(decision.authorizations).toEqual([]);
    });

    it('should sign a QuorumDecision', async () => {
        const decision = new QuorumDecision({
            proposer: 'proposer1',
            cluster: 'cluster1',
            quorum: 'quorum1',
            payload: [ { data: 'test' } ],
            action: 'ADD_MEMBER',
        });

        // const mockSigner = {
        //     async signMessageWithSecp256k1(message) {
        //         const signableMessage = decision.toDoc(publicKey.toString('hex'))
        //         // const escaped = escapeHTML(sortedJsonByKeyStringify(signableMessage));
        //         // const signableMessageBuffer = Buffer.from(escaped, 'utf-8');
        //         // const hashedMessage = Buffer.from(sha256(signableMessageBuffer)).toString('hex');
        //         // const signature = secp256k1.sign(hashedMessage, privateKey.toString('hex'));
        //         // const sig = Buffer.from(signature.toCompactRawBytes()).toString('hex');
        //         // return [sig, publicKey.toString('hex')];
        //     },
        //     getMoniker() {
        //         return 'proposer1';
        //     },
        //     toAddress() {
        //         return 'address1';
        //     },
        // };

        // await decision.sign(mockSigner);
        // expect(decision.authorizations.length).toBe(1);
        // const authorization = decision.authorizations[0];
        // expect(authorization.signature).toBeDefined();
        // expect(authorization.publicKey).toBe(publicKey.toString('hex'));
        // expect(authorization.moniker).toBe('proposer1');
    });

    // it('should verify signatures of a QuorumDecision', async () => {
    //     const decision = new QuorumDecision({
    //         proposer: 'proposer1',
    //         cluster: 'cluster1',
    //         quorum: 'quorum1',
    //         payload: { data: 'test' },
    //         action: 'ADD_MEMBER',
    //     });

    //     const mockSigner = {
    //         async signMessageWithSecp256k1(message) {
    //             const signableMessage = decision.toDoc(publicKey.toString('hex'))
    //             const escaped = escapeHTML(sortedJsonByKeyStringify(signableMessage));
    //             const signableMessageBuffer = Buffer.from(escaped, 'utf-8');
    //             const hashedMessage = Buffer.from(sha256(signableMessageBuffer)).toString('hex');
    //             const signature = secp256k1.sign(hashedMessage, privateKey.toString('hex'));
    //             const sig = Buffer.from(signature.toCompactRawBytes()).toString('hex');
    //             return [sig, publicKey.toString('hex')];
    //         },
    //         getMoniker() {
    //             return 'proposer1';
    //         },
    //         toAddress() {
    //             return 'address1';
    //         },
    //     };

    //     await decision.sign(mockSigner);
    //     const isValid = decision.verifySignatures();
    //     expect(isValid).toBe(true);
    // });
    it('should add an authorization to a QuorumDecision', () => {
        const decision = new QuorumDecision({
            proposer: 'proposer1',
            cluster: 'cluster1',
            quorum: 'quorum1',
            payload: [ { data: 'test' } ],
            action: 'ADD_MEMBER',
        });

        const authorization = {
            signature: Buffer.from('signature').toString('hex'),
            publicKey: publicKey.toString('hex'),
        };

        decision.addAuthorization(authorization);
        expect(decision.authorizations.length).toBe(1);
        expect(decision.authorizations[0].signature).toBe(authorization.signature);
        expect(decision.authorizations[0].publicKey).toBe(authorization.publicKey);
    });

    it('should throw error if signature is missing in addAuthorization', () => {
        const decision = new QuorumDecision({
            proposer: 'proposer1',
            cluster: 'cluster1',
            quorum: 'quorum1',
            payload: [ { data: 'test' } ],
            action: 'ADD_MEMBER',
        });


        expect(() => {
            decision.addAuthorization({ publicKey: publicKey.toString('hex') });
        }).toThrow('Signature is required for authorization.');
    });

    it('should verify with no signatures', () => {
        const decision = new QuorumDecision({
            proposer: 'proposer1',
            cluster: 'cluster1',
            quorum: 'quorum1',
            payload: [ { data: 'test' } ],
            action: 'ADD_MEMBER',
        });

        const isValidSignature = decision.verifyAuthorizations();
        expect(isValidSignature).toBe(true);
        const isValid = decision.isValid();
        expect(isValid).toBe(false);
    });

    it('should convert to hex without authorizations', () => {
        const decision = new QuorumDecision({
            proposer: 'proposer1',
            cluster: 'cluster1',
            quorum: 'quorum1',
            payload: [ { data: 'test' } ],
            action: 'ADD_MEMBER',
        });

        const hex = decision.toHex({ excludeAuthorization: true });
        expect(hex).toBeDefined();
    });

    it('should convert to hash without authorizations', () => {
        const decision = new QuorumDecision({
            proposer: 'proposer1',
            cluster: 'cluster1',
            quorum: 'quorum1',
            payload: [ { data: 'test' } ],
            action: 'ADD_MEMBER',
        });

        const hash = decision.toHash('hex', { excludeAuthorization: true });
        expect(hash).toBeDefined();
    });
});
