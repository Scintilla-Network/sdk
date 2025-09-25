import { IGovernanceProposalFunding} from "./IGovernanceProposalFunding.js";
import { IGovernanceVote } from "./IGovernanceVote.js";
import {IGovernanceProposalRules} from "./IGovernanceProposalRules.js";


export interface IGovernanceProposalOptions {
    hash?: string | null;
    title: string;
    description: string;
    funding?: IGovernanceProposalFunding;
    status?: string;
    votes?: IGovernanceVote[];
    rules?: IGovernanceProposalRules[];
    totalVotes?: number;
    startDate?: number;
    endDate: number;
    proposer?: string;
    dao: string;
}
