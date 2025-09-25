import { IData } from "./interfaces/IData.js";

declare class FIFOLookupMap {
    maxSize: number;
    primaryKey: string;
    map: Map<string, IData>;
    order: string[];

    constructor(maxSize: number, primaryKey?: string, data?: IData[]);

    static fromJSON(json: { maxSize: number; primaryKey: string; data: IData[] }): FIFOLookupMap;
    toJSON(): { maxSize: number; primaryKey: string; data: IData[] };
    get(primaryKeyValue: string): IData | undefined;
    add(data: IData): void;
    getLast(propertyName: string, value?: any): IData | null;
    remove(primaryKeyValue: string): void;
    private getNestedProperty(obj: any, path: string): any;
}

export default FIFOLookupMap;

