export interface IPeerProps {
    hostname: string;
    port: string | number;
    type?: string;
}

declare class Peer {
    hostname: string;
    port: string | number;
    id: string;
    type: string;
    services: Record<string, any>;

    constructor(props: IPeerProps | string);
    static fromString(uri: string): Peer;
    synchronize(): Promise<void>;
    toJSON(): object;
}

export default Peer;


