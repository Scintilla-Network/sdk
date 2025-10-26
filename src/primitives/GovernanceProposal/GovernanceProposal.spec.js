import { describe, it, expect } from '@scintilla-network/litest';
import GovernanceProposal from './GovernanceProposal.js';
import { Wallet } from '@scintilla-network/wallet';

describe('GovernanceProposal', () => {
    it('initializes correctly with mandatory fields', () => {
        const proposal = new GovernanceProposal({
            title: 'Test Proposal',
            description: 'A test proposal',
            endDate: Date.now() + 10000, // 10 seconds from now
            dao: 'test-dao',
        });

        expect(proposal.title).toBe('Test Proposal');
        expect(proposal.description).toBe('A test proposal');
        expect(proposal.status).toBe('proposed');
        expect(proposal.votes).toEqual([]);
        expect(proposal.totalVotes).toBe(0);
        expect(proposal.dao).toBe('test-dao');
        expect(proposal.hash).not.toBeNull();
    });

    it('throws an error if funding is provided without a recipient', () => {
        expect(() => {
            new GovernanceProposal({
                title: 'Funding Proposal',
                description: 'Proposal with funding but no recipient',
                funding: {
                    type: "IMMEDIATE",
                    amount: 1000,
                    asset: "SCT"
                },
                endDate: Date.now() + 10000, // 10 seconds from now
                dao: 'test-dao',
            });
        }).toThrow('GovernanceProposal with funding must have a recipient');
    });

    it('correctly handles votes', () => {
        const proposal = new GovernanceProposal({
            title: 'Voting Proposal',
            description: 'Proposal for voting',
            endDate: Date.now() + 10000, // 10 seconds from now
            dao: 'test-dao',
        });

        proposal.considerVote({ vote: 'yes', voter: 'voter1', votingPower: 100 });
        expect(proposal.votes.length).toBe(1);
        expect(proposal.totalVotes).toBe(100);
    });

    it('serializes to JSON correctly', () => {
        const proposal = new GovernanceProposal({
            title: 'Serialization Test',
            description: 'Testing toJSON method',
            endDate: Date.now() + 10000, // 10 seconds from now
            dao: 'test-dao',
        });

        const json = proposal.toJSON();
        expect(json.title).toBe('Serialization Test');
        expect(json.description).toBe('Testing toJSON method');
        expect(json.dao).toBe('test-dao');
        expect(json.status).toBe('proposed');
    });

    it('converts to a Uint8Array correctly', () => {
        const proposal = new GovernanceProposal({
            title: 'Conversion Test',
            description: 'Testing toUint8Array method',
            proposer: 'scintilla',
            dao: 'test-dao',
            startDate: 1758828624880n,
            timestamp: 1758828624880n,
            endDate: 1758828624880n + 10000n, // 10 seconds from now,
            votes: [{
                vote: 'yes',
                voter: 'scintilla',
                votingPower: 100n,
            }],
        });
        const parsedProposal = GovernanceProposal.fromUint8Array(proposal.toUint8Array());
        expect(parsedProposal.toHash('hex')).toEqual(proposal.toHash('hex'));
        expect(parsedProposal.toHex()).toEqual(proposal.toHex());
        expect(parsedProposal.toJSON()).toEqual(proposal.toJSON());
        expect(parsedProposal.toUint8Array()).toEqual(proposal.toUint8Array());
        expect(parsedProposal.toHash('hex')).toEqual('d85764754a3d0f1b1cfb2b16ed0dcfe6292dc418f156f2ae212aa6f203510797');
    });

    it('should sign and verify a GovernanceProposal', async () => {
        const signer = Wallet.fromMnemonic('test test test test test test test test test test test junk')
                                .getAccount(0)
                                .getPersona('alice')
                                .getSigner();
        const proposal = new GovernanceProposal({
            title: 'Test Proposal',
            description: 'A test proposal',
        });
        const signedProposal = await proposal.sign(signer);
        expect(signedProposal.verifyAuthorizations()).toBe(true);
        expect(signedProposal.isValid()).toBe(true);
        expect(GovernanceProposal.fromUint8Array(signedProposal.toUint8Array()).toHash('hex')).toEqual(signedProposal.toHash('hex'));
    });
});
