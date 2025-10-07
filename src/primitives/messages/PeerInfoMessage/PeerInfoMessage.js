import { serialize } from '../../../utils/serialize/index.js';
// import { deserialize } from '../../../utils/deserialize/index.js';
import deserialize from '../../../utils/deserialize/index.js';
import { NET_KINDS, NET_KINDS_ARRAY } from "../NetMessage/NET_KINDS.js";
import { Identity } from "../../Identity/Identity.js";

 export class PeerInfoMessage {
    constructor(props = {}) {

        this.kind = 'PEERINFO';
        this.version = 1;
        this.quorum = props.quorum ;
        this.host = props.host || '0.0.0.0';
        this.port = props.port || 8888;

        this.identity = props.identity;
        // this.config = props.config;
    }

    static fromUint8Array(input) {
        let offset = 0;
        const { value: kindValue, length: kindLength } = deserialize.toVarInt(input.slice(0));
        offset += kindLength;

        const { value: versionValue, length: versionLength } = deserialize.toVarInt(input.slice(offset));
        offset += versionLength;

        // const { value: clusterValue, length: clusterLength } = deserialize.toString(input.slice(offset));
        // offset += clusterLength;

        const { value: quorumValue, length: quorumLength } = deserialize.toString(input.slice(offset));
        offset += quorumLength;

        const { value: hostValue, length: hostLength } = deserialize.toString(input.slice(offset));
        offset += hostLength;

        const { value: portValue, length: portLength } = deserialize.toVarInt(input.slice(offset));
        offset += portLength;

        const identity = Identity.fromUint8Array(input.slice(offset));
        offset += identity.toUint8Array().length;

        return new PeerInfoMessage({
            kind: kindValue,
            version: versionValue,
            // cluster: clusterValue,
            quorum: quorumValue,
            host: hostValue,
            port: portValue,
            identity: identity,
        });
    }

    toUint8Array() {
        let totalLength = 0;
        const kindValue = NET_KINDS[this.kind]
        const { value: kindUint8Array } = serialize.fromVarInt(kindValue);
        totalLength += kindUint8Array.length;

        const { value: versionUint8Array } = serialize.fromVarInt(this.version);
        totalLength += versionUint8Array.length;

        // const { value: clusterNameArray, length: clusterNameArrayLength } = serialize.fromString(this.cluster);
        // totalLength += clusterNameArrayLength;


        const { value: quorumNameArray, length: quorumNameArrayLength } = serialize.fromString(this.quorum);
        totalLength += quorumNameArrayLength;

        // Host parsed as a string
        if(!this.host) {
            throw new Error('Host is required');
        }
        const { value: hostUint8Array, length: hostUint8ArrayLength } = serialize.fromString(this.host);
        totalLength += hostUint8ArrayLength;

        if(!this.port) {
            throw new Error('Port is required');
        }
        // Port parsed as a number
        const { value: portUint8Array, length: portUint8ArrayLength } = serialize.fromVarInt(this.port);
        totalLength += portUint8ArrayLength;

        // Identity directly toUint8Array or casted and toUint8Array
        let identityUint8Array;
        if(this.identity && this.identity.kind === 'IDENTITY') {
            if(this.identity.toUint8Array) {
                identityUint8Array = this.identity.toUint8Array();
            } else {
                identityUint8Array = Identity.fromJSON(this.identity).toUint8Array();
            }
        } else {
            throw new Error('Identity is not a valid Identity');
        }
        
        totalLength += identityUint8Array.length;

        const result = new Uint8Array(totalLength);

        let offset = 0;
        result.set(kindUint8Array, offset); offset += kindUint8Array.length;
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;

        // result.set(clusterNameArray, offset); offset += clusterNameArray.length;
        result.set(quorumNameArray, offset); offset += quorumNameArray.length;

        result.set(hostUint8Array, offset); offset += hostUint8Array.length;
        result.set(portUint8Array, offset); offset += portUint8Array.length;

        result.set(identityUint8Array, offset); offset += identityUint8Array.length;

        return result;
    }
}

export default PeerInfoMessage;

