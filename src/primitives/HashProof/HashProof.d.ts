import HashProofHeader from "./HashProofHeader.js";
import HashProofPayload from "./HashProofPayload.js";
import {IHashProofOptions} from "./interfaces/IHashProofOptions.js";
import {IHashProofPayloadElement} from "./interfaces/IHashProofPayloadElement.js";

declare class HashProof {
    header: HashProofHeader;
    payload: HashProofPayload;

    constructor(options?: IHashProofOptions);

    consider(element: IHashProofPayloadElement): Promise<void>;
    toUint8Array(): Uint8Array;
    toHex(): string;
    toHash(encoding?: BufferEncoding): string;
    static fromHex(hex: string): HashProof;
    static fromUint8Array(uint8Array: Uint8Array): HashProof;
    static generateMerkleRoot(data: any[], encoding?: BufferEncoding): { hash: string; proofs: any[]; };
    toJSON(): object;
    checkNonce(nonce: bigint): [boolean, any];
    toDoc(signer: any): any;
    sign(signer: any): Promise<any>;
    isValid(): { valid: boolean, error?: string };
}

export default HashProof;

