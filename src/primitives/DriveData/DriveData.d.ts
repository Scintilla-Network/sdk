import { IDriveDataOptions } from "./interfaces/IDriveDataOptions.js";

declare class DriveData {
    type: string;
    content: string;

    constructor(options?: IDriveDataOptions);

    toJSON(): { type: string; content: string };
    toBuffer(): Buffer;
    toHash(encoding?: BufferEncoding): string;
    static fromHex(hex: string): DriveData;
    static fromBuffer(buffer: Buffer): DriveData;
    toHex(): string;
    toString(): string;
    static fromJSON(json: IDriveDataOptions): DriveData;
}

export default DriveData;

