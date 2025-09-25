import {IGovernanceProposalFunding} from "./interfaces/IGovernanceProposalFunding.js";
import {IGovernanceProposalOptions} from "./interfaces/IGovernanceProposalOptions.js";
import { IGovernanceVote } from "./interfaces/IGovernanceVote.js";
import {IGovernanceProposalRules} from "./interfaces/IGovernanceProposalRules.js";

declare class GovernanceProposal {
    hash: string | null;
    title: string;
    description: string;
    funding?: IGovernanceProposalFunding;
    status: string;
    votes: IGovernanceVote[];
    totalVotes: number;
    startDate?: number;
    endDate: number;
    proposer?: string;
    dao: string;
    rules: IGovernanceProposalRules[] | { kind: string; options?: string[], value: string }[];

    constructor(options: IGovernanceProposalOptions);

    considerVote({ vote, voter, votingPower }: { vote: string; voter: string; votingPower: number; }): void;
    toBuffer(): Buffer;
    toJSON(): IGovernanceProposalOptions;
}

export default GovernanceProposal;

