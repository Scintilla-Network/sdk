// import { describe, it, expect } from 'vitest';
import { describe, it, expect } from '@scintilla-network/litest';
import GovernanceVote from './GovernanceVote.js';

describe('GovernanceVote', () => {
    const voteOptions = {
        proposal: "c3380d33ab1448bd69c76193c2426576590ff23df5415f268b1e6639c963d6d1",
        dao: "scintilla-dao",
        vote: "YES",
        timestamp: 1758828624880n,
        voter: "alice",
    };

    it('initializes correctly with provided options', () => {
        const proposalVote = new GovernanceVote(voteOptions);

        expect(proposalVote.proposal).toBe(voteOptions.proposal);
        expect(proposalVote.dao).toBe(voteOptions.dao);
        expect(proposalVote.vote).toBe(voteOptions.vote);
        expect(proposalVote.timestamp).toBe(1758828624880n);
    });

    it('correctly serializes to JSON', () => {
        const proposalVote = new GovernanceVote(voteOptions);
        const json = proposalVote.toJSON();

        expect(json).toEqual({
            kind: "GOVERNANCE_VOTE",
            version: 1,
            timestamp: "1758828624880",
            proposal: "c3380d33ab1448bd69c76193c2426576590ff23df5415f268b1e6639c963d6d1",
            vote: "YES",
            dao: "scintilla-dao",
            voter: "alice",
            votingPower: 0,
            authorizations: [],
        });
    });

    it('generates a consistent hash', () => {
        const proposalVote = new GovernanceVote(voteOptions);
        const hash = proposalVote.toHash();

        // Check if hash is a non-empty string.
        // This test assumes the sha256 function is correctly hashing the input.
        // For more accurate testing, consider mocking the sha256 function if its output is predictable.
        expect(hash).toBeTruthy();
        expect(typeof hash).toBe('string');
        expect(hash.length).toBeGreaterThan(0);
    });

    it('converts to a Buffer correctly', () => {
        const proposalVote = new GovernanceVote(voteOptions);
        const buffer = proposalVote.toBuffer();

        // Check if buffer is correctly generated from JSON representation.
        // This is a basic check; you may want to add more specific tests based on known inputs and outputs.
        expect(buffer).toBeInstanceOf(Uint8Array);
        expect(buffer.length).toBeGreaterThan(0);
    });

    it('converts to a Uint8Array correctly', () => {
        const proposalVote = new GovernanceVote(voteOptions);
        const uint8Array = proposalVote.toUint8Array();
        const parsedProposalVote = GovernanceVote.fromUint8Array(uint8Array);
        expect(parsedProposalVote.toHash()).toEqual(proposalVote.toHash());
        expect(parsedProposalVote.toHex()).toEqual(proposalVote.toHex());
        expect(parsedProposalVote.toJSON()).toEqual(proposalVote.toJSON());
        expect(parsedProposalVote.toUint8Array()).toEqual(proposalVote.toUint8Array());
        expect(parsedProposalVote.toHash()).toEqual('7f8ed9f571cf7b0ec0c3b1e63f9bc0ffd76a08605e8390a4b106233920b28563');
    });
    
    
});
