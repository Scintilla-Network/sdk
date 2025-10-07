import { describe, it, expect } from '@scintilla-network/litest';
import { sha256 } from "@scintilla-network/hashes/classic";
import { secp256k1 } from "@scintilla-network/signatures/classic";

import QuorumDecisionVote from './QuorumDecisionVote.js';

describe('QuorumDecisionVote', () => {
    const privateKey = Buffer.from('1e99423a4ed27608a15a2616df64c2d505c4d12db36e7106de5f9e422c41f489', 'hex');
    const publicKey = Buffer.from(secp256k1.getPublicKey(privateKey)).toString('hex');

    it('should create a QuorumDecisionVote', () => {
        const vote = new QuorumDecisionVote({
            decisionHash: 'hash1',
            voter: 'voter1',
            vote: ['YES'],
            payload: [ { data: 'test' } ],
        });

        expect(vote).toBeDefined();
        expect(vote.decisionHash).toBe('hash1');
        expect(vote.voter).toBe('voter1');
        expect(vote.vote).toEqual(['YES']);
        expect(vote.payload).toEqual([ { data: 'test' } ]);
        expect(vote.timestamp).toBeDefined();
        expect(vote.authorizations).toEqual([]);
    });

    // it('should sign a QuorumDecisionVote', async () => {
    //     const vote = new QuorumDecisionVote({
    //         decisionHash: 'hash1',
    //         voter: 'voter1',
    //         vote: ['YES'],
    //         payload: [ { data: 'test' } ],
    //     });

    //     const mockSigner = {
    //         async signMessageWithSecp256k1(message) {
    //             const signableMessage = vote.toDoc(publicKey.toString('hex'))
    //             const escaped = escapeHTML(sortedJsonByKeyStringify(signableMessage));
    //             const signableMessageBuffer = Buffer.from(escaped, 'utf-8');
    //             const hashedMessage = Buffer.from(sha256(signableMessageBuffer)).toString('hex');
    //             const signature = secp256k1.sign(hashedMessage, privateKey.toString('hex'));
    //             const sig = Buffer.from(signature.toCompactRawBytes()).toString('hex');
    //             return [sig, publicKey.toString('hex')];
    //         },
    //         getMoniker() {
    //             return 'voter1';
    //         },
    //         toAddress() {
    //             return 'address1';
    //         },
    //     };

    //     await vote.sign(mockSigner);
    //     expect(vote.authorizations.length).toBe(1);
    //     const authorization = vote.authorizations[0];
    //     expect(authorization.signature).toBeDefined();
    //     expect(authorization.publicKey).toBe(publicKey.toString('hex'));
    //     expect(authorization.moniker).toBe('voter1');
    // });

    // it('should verify signatures of a QuorumDecisionVote', async () => {
    //     const vote = new QuorumDecisionVote({
    //         decisionHash: 'hash1',
    //         voter: 'voter1',
    //         vote: ['YES'],
    //         payload: [ { data: 'test' } ],
    //     });

    //     const mockSigner = {
    //         async signMessageWithSecp256k1(message) {
    //             const signableMessage = vote.toDoc(publicKey.toString('hex'))
    //             const escaped = escapeHTML(sortedJsonByKeyStringify(signableMessage));
    //             const signableMessageBuffer = Buffer.from(escaped, 'utf-8');
    //             const hashedMessage = Buffer.from(sha256(signableMessageBuffer)).toString('hex');
    //             const signature = secp256k1.sign(hashedMessage, privateKey.toString('hex'));
    //             const sig = Buffer.from(signature.toCompactRawBytes()).toString('hex');
    //             return [sig, publicKey.toString('hex')];
    //         },
    //         getMoniker() {
    //             return 'voter1';
    //         },
    //         toAddress() {
    //             return 'address1';
    //         },
    //     };

    //     await vote.sign(mockSigner);
    //     const isValid = vote.verifySignatures();
    //     expect(isValid).toBe(true);
    // });

    it('should add an authorization to a QuorumDecisionVote', () => {
        const vote = new QuorumDecisionVote({
            decisionHash: 'hash1',
            voter: 'voter1',
            vote: ['YES'],
            payload: [ { data: 'test' } ],
        });

        const authorization = {
            signature: Buffer.from('signature').toString('hex'),
            publicKey: publicKey.toString('hex'),
        };

        vote.addAuthorization(authorization);
        expect(vote.authorizations.length).toBe(1);
        expect(vote.authorizations[0]).toBe(authorization);
    });

    it('should throw error if signature is missing in addAuthorization', () => {
        const vote = new QuorumDecisionVote({
            decisionHash: 'hash1',
            voter: 'voter1',
            vote: ['YES'],
            payload: [ { data: 'test' } ],
        });

        expect(() => {
            vote.addAuthorization({ publicKey: publicKey.toString('hex') });
        }).toThrow('Signature is required for authorization.');
    });

    it('should verify with no signatures', () => {
        const vote = new QuorumDecisionVote({
            decisionHash: 'hash1',
            voter: 'voter1',
            vote: ['YES'],
            payload: [ { data: 'test' } ],
        });

        const isValidSignature = vote.verifyAuthorizations();
        expect(isValidSignature).toBe(true);
        const isValid = vote.isValid();
        expect(isValid).toBe(false);
    });

    it('should convert to hex without authorizations', () => {
        const vote = new QuorumDecisionVote({
            decisionHash: 'hash1',
            voter: 'voter1',
            vote: ['YES'],
            payload: [ { data: 'test' } ],
        });

        const hex = vote.toHex({ excludeAuthorizations: true });
        expect(hex).toBeDefined();
    });

    it('should convert to hash without authorizations', () => {
        const vote = new QuorumDecisionVote({
            decisionHash: 'hash1',
            voter: 'voter1',
            vote: ['YES'],
            payload: [ { data: 'test' } ],
        });

        const hash = vote.toHash('hex', { excludeAuthorizations: true });
        expect(hash).toBeDefined();
    });
});
