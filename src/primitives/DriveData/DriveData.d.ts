import { IDriveDataOptions } from "./interfaces/IDriveDataOptions.js";

declare class DriveData {
    type: string;
    content: string;

    constructor(options?: IDriveDataOptions);

    /**
     * Convert DriveData to a JSON object
     */
    toJSON(): { type: string; content: string };

    /**
     * Serialize DriveData to binary format (Uint8Array)
     */
    toUint8Array(): Uint8Array;

    /**
     * Convert DriveData to hexadecimal string representation
     */
    toHex(): string;

    /**
     * Generate SHA-256 hash of the serialized data
     * @param encoding - Output format: 'uint8array' or 'hex' (default: 'uint8array')
     */
    toHash(encoding?: 'uint8array' | 'hex'): string | Uint8Array;

    /**
     * Convert DriveData to string (hex representation)
     */
    toString(): string;

    /**
     * Create DriveData instance from JSON object
     */
    static fromJSON(json: IDriveDataOptions): DriveData;

    /**
     * Deserialize DriveData from hexadecimal string
     */
    static fromHex(hex: string): DriveData;

    /**
     * Deserialize DriveData from binary data
     */
    static fromUint8Array(uint8Array: Uint8Array): DriveData;

    /**
     * Get list of all valid standard types
     */
    static getValidTypes(): string[];

    /**
     * Validate if a type string is acceptable
     */
    static isValidType(type: string): boolean;
}

export { DriveData };
export default DriveData;

