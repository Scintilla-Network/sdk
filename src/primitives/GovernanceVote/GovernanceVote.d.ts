import { IGovernanceVoteOptions } from "./interfaces/IGovernanceVoteOptions.js";

declare class GovernanceVote {
    proposal: string;
    vote: string;
    dao: string;

    constructor(options: IGovernanceVoteOptions);

    toBuffer(): Buffer;
    toHash(): string;
    toJSON(): IGovernanceVoteOptions;
}

export default GovernanceVote;

