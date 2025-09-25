export interface IHashProofPayloadElement {
    type: string;
    kind: "TRANSACTION" | "TRANSITION" | "TRANSFER";
    timestamp: number;
    data: any; // Consider making this more specific or generic based on usage

    isValid(): { valid: boolean, error?: string };
}
