import { IAssetOptions, IConsensus, IDistribution, ISymbol } from "./interfaces/IAssetOptions.js";
import { IPermissions } from "./interfaces/IPermissions.js";
import { IMetadata } from "./interfaces/IMetadata.js";
import { ISupply } from "./interfaces/ISupply.js";
import { IFees } from "./interfaces/IFees.js";

export declare class Asset {
    name: string;
    symbol: ISymbol;
    supply: ISupply;
    consensus: IConsensus;
    decimals: number;
    distributions: IDistribution[];
    permissions: IPermissions;
    fees: IFees;
    metadata: IMetadata;
    
    constructor(options?: IAssetOptions);
    
    /**
     * Returns the JSON representation of the Asset
     * @returns The JSON representation of the Asset
     */
    toJSON(): IAssetOptions;
}

export default Asset;

