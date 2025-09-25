// src/messages/PeerInfoMessage.d.ts
import {IPeerInfoMessageOptions} from "./interfaces/IPeerInfoMessageOptions.js";
import {NetMessage} from "../NetMessage/NetMessage.js";

export declare class PeerInfoMessage {
    identity: {
        moniker: string;
    }
    cluster?: string;
    quorum?: string;

    constructor(options?: IPeerInfoMessageOptions);

    toMessage(props?: any): NetMessage;
}

export default PeerInfoMessage;

