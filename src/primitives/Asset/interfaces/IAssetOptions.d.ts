// src/models/interfaces/IAssetOptions.ts
import { ISupply } from "./ISupply.js";
import { IPermissions } from "./IPermissions.js";
import { IFees } from "./IFees.js";

export type ISymbol = string | bigint;

export type IDistribution = {
    pattern: string;
    weight: number;
    roles: Record<string, number>;
}

export type IConsensus = {
    members: [string, bigint][];
    type?: string;
    requirements?: any[];
    distributions?: IDistribution[];
}

export interface IAssetOptions {
    name?: string;
    symbol?: ISymbol;
    supply?: ISupply;
    consensus?: IConsensus;
    decimals?: number;
    distributions?: IDistribution[];
    permissions?: IPermissions;
    fees?: IFees;
    metadata?: Record<string, string>;
}