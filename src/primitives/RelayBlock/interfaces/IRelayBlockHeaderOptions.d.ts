export interface IRelayBlockHeaderOptions {
    timestamp?: Date;
    epoch?: number;
    previousHash?: string | null;
    proposer?: string | null;
}
