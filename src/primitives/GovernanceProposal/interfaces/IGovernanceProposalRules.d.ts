// Rules can be like `oneOf(['yes','no'])` or `someOf(['blue','green','red'])` or `standard` which is a oneOf(['yes','no','abstain'])
export interface IGovernanceProposalRules {
    kind: string;
    options?: string[];
    value: string;
}
