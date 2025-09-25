// src/messages/PeerInfoMessage.js
import {NetMessage} from "../NetMessage/NetMessage.js";
import { utils } from '@scintilla-network/keys';
const { uint8array } = utils;

export class PeerInfoMessage {
    constructor({identity = {moniker: 'unknown'}, cluster = 'unknown', quorum = 'unknown'} = {}) {
        this.identity = identity;
        this.cluster = cluster;
        this.quorum = quorum;
    }

    toMessage(props = {}) {
        return new NetMessage({
            kind: 'PEER_INFO',
            cluster: this.cluster,
            payload: uint8array.fromString(JSON.stringify({
                identity: this.identity,
                quorum: this.quorum,
                cluster: this.cluster,
            })),
            ...props,
        });
    }
}

export default PeerInfoMessage;

