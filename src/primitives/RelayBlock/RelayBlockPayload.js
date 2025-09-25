
import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
import { uint8array, varint, json } from '@scintilla-network/keys/utils';

import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
import { Voucher } from '../Voucher/Voucher.js';
import { Transaction } from '../Transaction/Transaction.js';
import { Transfer } from '../Transfer/Transfer.js';

export class RelayBlockPayload {
    constructor(options = {}) {
        this.actions = options.actions || [];
        this.clusters = options.clusters || [];
    }

    considerStateAction(stateAction) {
        this.actions.push(stateAction);
    }

    considerCluster(clusterMoniker, clusterHash) {
        if (!clusterMoniker) {
            console.error('RelayBlockPayload tried to consider an undefined cluster.');
            return;
        }

        this.clusters.push([clusterMoniker, clusterHash]);
    }

    toUint8Array() {
        // const actionsString = json.stringify(this.actions);
        // const actionsUint8Array = uint8array.fromString(actionsString);
        // const actionsLengthUint8Array = varint.encodeVarInt(actionsUint8Array.length);

        // const clustersString = json.stringify(this.clusters);
        // const clustersUint8Array = uint8array.fromString(clustersString);
        // const clustersLengthUint8Array = varint.encodeVarInt(clustersUint8Array.length);

        // const totalLength = actionsLengthUint8Array.length + actionsUint8Array.length + clustersLengthUint8Array.length + clustersUint8Array.length;
        // const result = new Uint8Array(totalLength);
        // let offset = 0;
        
        // result.set(actionsLengthUint8Array, offset); offset += actionsLengthUint8Array.length;
        // result.set(actionsUint8Array, offset); offset += actionsUint8Array.length;
        // result.set(clustersLengthUint8Array, offset); offset += clustersLengthUint8Array.length;
        // result.set(clustersUint8Array, offset);
       
        const actionsLengthValueBytes = varint.encodeVarInt(this.actions.length, 'uint8array');

        let resultBytes = new Uint8Array(actionsLengthValueBytes.length);
            // + this.actions.reduce((acc, action) => {
            //     const actionLengthBytes = varint.encodeVarInt(action.length, 'uint8array');
            //     return acc + actionLengthBytes;
            // }, 0) 
            // + this.actions.reduce((acc, action) => acc + action.length, 0) 
            // + this.clusters.reduce((acc, cluster) => acc + cluster.length, 0));

        let offset = 0;

        resultBytes.set(actionsLengthValueBytes, offset);
        offset += actionsLengthValueBytes.length;

        let actionsItemsBytes = new Uint8Array();
        this.actions.forEach(action => {
            const actionBytes = action?.toUint8Array?.() ?? action;
            const actionLengthBytes = varint.encodeVarInt(actionBytes.length, 'uint8array');
            let actionItemBytes = new Uint8Array(actionLengthBytes.length + actionBytes.length);
            actionItemBytes.set(actionLengthBytes, 0);
            actionItemBytes.set(actionBytes, actionLengthBytes.length);
            actionsItemsBytes = new Uint8Array([...actionsItemsBytes, ...actionItemBytes]);
            offset += actionBytes.length;
        });

        resultBytes = new Uint8Array([...resultBytes, ...actionsItemsBytes]);
        offset += actionsItemsBytes.length;
        
        
        const clustersLengthValueBytes = varint.encodeVarInt(this.clusters.length, 'uint8array');
        resultBytes = new Uint8Array([...resultBytes, ...clustersLengthValueBytes]);
        offset += clustersLengthValueBytes.length;

        let clustersItemsBytes = new Uint8Array();
        this.clusters.forEach(cluster => {
            const clusterMonikerBytes = uint8array.fromString(cluster[0]);
            const clusterMonikerByteLength = varint.encodeVarInt(cluster[0].length, 'uint8array');

            const clusterHashBytes = uint8array.fromHex(cluster[1]);
            const clusterHashByteLength = varint.encodeVarInt(cluster[1].length, 'uint8array');

            const clusterItemBytes = new Uint8Array(clusterMonikerByteLength.length + clusterMonikerBytes.length + clusterHashByteLength.length + clusterHashBytes.length);
            clusterItemBytes.set(clusterMonikerByteLength, 0);
            clusterItemBytes.set(clusterMonikerBytes, clusterMonikerByteLength.length);
            clusterItemBytes.set(clusterHashByteLength, clusterMonikerByteLength.length + clusterMonikerBytes.length);
            clusterItemBytes.set(clusterHashBytes, clusterMonikerByteLength.length + clusterMonikerBytes.length + clusterHashByteLength.length);
            clustersItemsBytes = new Uint8Array([...clustersItemsBytes, ...clusterItemBytes]);
            offset += clusterMonikerByteLength.length + clusterMonikerBytes.length + clusterHashByteLength.length + clusterHashBytes.length;
        });


        resultBytes = new Uint8Array([...resultBytes, ...clustersItemsBytes]);
        offset += clustersItemsBytes.length;

        return resultBytes;
    }

    toHash() {
        const uint8Array = this.toUint8Array();
        const hash = sha256(uint8Array);
        return uint8array.toHex(hash);
    }

    static fromUint8Array(inputArray) {
        const payloadProps = {};
        let offset = 0;

        const { value: actionsLength, length: actionsLengthBytes } = varint.decodeVarInt(inputArray.slice(offset));
        offset += actionsLengthBytes;

        payloadProps.actions = [];
        for (let i = 0; i < actionsLength; i++) {
            const { value: actionLength, length: actionLengthBytes } = varint.decodeVarInt(inputArray.slice(offset));
            offset += actionLengthBytes;
            const actionKind = inputArray[offset];
            // offset += 1;
            switch (actionKind) {
                case NET_KINDS['TRANSFER']:
                    const transfer = Transfer.fromUint8Array(inputArray.slice(offset, offset + actionLength));
                    offset += transfer.toUint8Array().length;
                    payloadProps.actions.push(transfer);
                    break;
                case NET_KINDS['VOUCHER']:
                    const voucher = Voucher.fromUint8Array(inputArray.slice(offset, offset + actionLength));
                    offset += voucher.toUint8Array().length;
                    payloadProps.actions.push(voucher);
                    break;  
                case NET_KINDS['TRANSACTION']:
                    const transaction = Transaction.fromUint8Array(inputArray.slice(offset, offset + actionLength));
                    offset += transaction.toUint8Array().length;
                    payloadProps.actions.push(transaction);
                    break;
                default:
                    throw new Error(`Unknown action kind: ${actionKind}`);  
            }
        }

        payloadProps.clusters = [];
        const { value: clustersLength, length: clustersLengthBytes } = varint.decodeVarInt(inputArray.slice(offset));
        for (let i = 0; i < clustersLength; i++) {
            offset += clustersLengthBytes;
            const { value: clusterMonikerLength, length: clusterMonikerLengthBytes } = varint.decodeVarInt(inputArray.slice(offset));
            offset += clusterMonikerLengthBytes;
            const clusterMoniker = uint8array.toString(inputArray.slice(offset, offset + clusterMonikerLength));
            offset += clusterMonikerLength;
            const { value: clusterHashLength, length: clusterHashLengthBytes } = varint.decodeVarInt(inputArray.slice(offset));
            offset += clusterHashLengthBytes;
            const clusterHash = uint8array.toHex(inputArray.slice(offset, offset + clusterHashLength));
            offset += clusterHashLength;
            const cluster = [clusterMoniker, clusterHash];
            payloadProps.clusters.push(cluster);
        }   

        return new RelayBlockPayload(payloadProps); 
       
    }

    toJSON() {
        return {
            actions: this.actions,
            clusters: this.clusters,
        }
    }
}

export default RelayBlockPayload;
