// Either another Identity moniker, or a publickey, or a sct address
export type IIdentityMemberIdentifier = string;
// [identifier, ownerWeight, spendWeight, stakeWeigth, proposeWeight, voteWeight, operateWeight]
export type IIdentityMember = [string, number?, number?, number?, number?, number?, number?];

export type IIdentityMembers = IIdentityMember[];
