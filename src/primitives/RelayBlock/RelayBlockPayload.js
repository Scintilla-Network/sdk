import { sha256 } from '@scintilla-network/hashes/classic';
import { uint8array, varint } from '@scintilla-network/keys/utils';

import { serialize } from '../../utils/serialize/index.js';
// import { deserialize } from '../../utils/deserialize/index.js';
import deserialize from '../../utils/deserialize/index.js';
import { kindToConstructor } from '../../utils/kindToConstructor.js';


function loadActions(actions) {
    return actions.map(action => {
        try {
            if(action.kind && !action.fromJSON){
                const constructor = kindToConstructor(action.kind);
                return constructor.fromJSON(action);
            }
            return action;
        } catch (e) {
            console.error('Failed to parse action:', e, action);
            throw new Error(`Failed to parse action: ${e.message}`);
        }
    });
}

export class RelayBlockPayload {
    constructor(options = {}) {
        this.actions = loadActions(options.actions || []);
        this.clusters = options.clusters || [];
    }

    static fromJSON(json) {
        return new RelayBlockPayload({
            ...json,
        });
    }

    static fromUint8Array(inputArray) {
        const payloadProps = {};
        let offset = 0;

          // Actions
          const {value: actionsTotalLength, length: actionsTotalLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
          offset += actionsTotalLengthBytes;
          const actions = deserialize.toArray(inputArray.subarray(offset));
          payloadProps.actions = actions.value;
          offset += actionsTotalLength;
  
          // Clusters
          const {value: clustersTotalLength, length: clustersTotalLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
          offset += clustersTotalLengthBytes;
          const clusters = deserialize.toArray(inputArray.subarray(offset));
          payloadProps.clusters = clusters.value;
          offset += clustersTotalLength;


        // const { value: actionsLength, length: actionsLengthBytes } = varint.decodeVarInt(inputArray.slice(offset));
        // offset += actionsLengthBytes;


        // payloadProps.actions = [];
        // for (let i = 0; i < actionsLength; i++) {
        //     const { value: actionLength, length: actionLengthBytes } = varint.decodeVarInt(inputArray.slice(offset));
        //     offset += actionLengthBytes;
        //     const actionKind = inputArray[offset];
        //     // offset += 1;
        //     switch (actionKind) {
        //         case NET_KINDS['TRANSFER']:
        //             const transfer = Transfer.fromUint8Array(inputArray.slice(offset, offset + actionLength));
        //             offset += transfer.toUint8Array().length;
        //             payloadProps.actions.push(transfer);
        //             break;
        //         case NET_KINDS['VOUCHER']:
        //             const voucher = Voucher.fromUint8Array(inputArray.slice(offset, offset + actionLength));
        //             offset += voucher.toUint8Array().length;
        //             payloadProps.actions.push(voucher);
        //             break;  
        //         case NET_KINDS['TRANSACTION']:
        //             const transaction = Transaction.fromUint8Array(inputArray.slice(offset, offset + actionLength));
        //             offset += transaction.toUint8Array().length;
        //             payloadProps.actions.push(transaction);
        //             break;
        //         case NET_KINDS['TRANSITION']:
        //             const transition = Transition.fromUint8Array(inputArray.slice(offset, offset + actionLength));
        //             offset += transition.toUint8Array().length;
        //             payloadProps.actions.push(transition);
        //             break;
        //         default:
        //             throw new Error(`Unknown action kind: ${actionKind}`);  
        //     }
        // }

        // Data
        // const {value: dataTotalLength, length: dataTotalLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        // offset += dataTotalLengthBytes;
        // payloadProps.actions = StateActionData.fromUint8Array(inputArray.subarray(offset, offset + dataTotalLength));
        // offset += dataTotalLength;


        // payloadProps.clusters = [];
        // const { value: clustersLength, length: clustersLengthBytes } = varint.decodeVarInt(inputArray.slice(offset));
        // for (let i = 0; i < clustersLength; i++) {
        //     offset += clustersLengthBytes;
        //     const { value: clusterMonikerLength, length: clusterMonikerLengthBytes } = varint.decodeVarInt(inputArray.slice(offset));
        //     offset += clusterMonikerLengthBytes;
        //     const clusterMoniker = uint8array.toString(inputArray.slice(offset, offset + clusterMonikerLength));
        //     offset += clusterMonikerLength;
        //     const { value: clusterHashLength, length: clusterHashLengthBytes } = varint.decodeVarInt(inputArray.slice(offset));
        //     offset += clusterHashLengthBytes;
        //     const clusterHash = uint8array.toHex(inputArray.slice(offset, offset + clusterHashLength));
        //     offset += clusterHashLength;
        //     const cluster = [clusterMoniker, clusterHash];
        //     payloadProps.clusters.push(cluster);
        // }   

        return new RelayBlockPayload(payloadProps); 
       
    }

    considerStateAction(stateAction) {
        // console.log(`Considering state action: ${stateAction.toHex()} of kind ${stateAction.kind} - type ${stateAction.type} - action: ${stateAction.action}`);
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
         // Actions
         const actionsUint8Array = serialize.fromArray(this.actions);
         const actionsTotalLengthUint8Array = varint.encodeVarInt(actionsUint8Array.value.length, 'uint8array');

         // Clusters
         const clustersUint8Array = serialize.fromArray(this.clusters);
         const clustersTotalLengthUint8Array = varint.encodeVarInt(clustersUint8Array.value.length, 'uint8array');

         const totalLength = 0
         + actionsTotalLengthUint8Array.length + actionsUint8Array.value.length
         + clustersTotalLengthUint8Array.length + clustersUint8Array.value.length;

         const result = new Uint8Array(totalLength);
         let offset = 0;

         result.set(actionsTotalLengthUint8Array, offset); offset += actionsTotalLengthUint8Array.length;
         result.set(actionsUint8Array.value, offset); offset += actionsUint8Array.value.length;

         result.set(clustersTotalLengthUint8Array, offset); offset += clustersTotalLengthUint8Array.length;
         result.set(clustersUint8Array.value, offset); offset += clustersUint8Array.value.length;

         return result;


        // const actionsLengthValueBytes = varint.encodeVarInt(this.actions.items.length, 'uint8array');

        // let resultBytes = new Uint8Array(actionsLengthValueBytes.length);

        // let offset = 0;

        // resultBytes.set(actionsLengthValueBytes, offset);
        // offset += actionsLengthValueBytes.length;

        // return resultBytes;
        // let actionsItemsBytes = new Uint8Array();
        // this.actions.forEach(action => {
        //     const actionBytes = action?.toUint8Array?.() ?? action;
        //     const actionLengthBytes = varint.encodeVarInt(actionBytes?.length ?? 0, 'uint8array');
        //     let actionItemBytes = new Uint8Array(actionLengthBytes.length + actionBytes.length);
        //     actionItemBytes.set(actionLengthBytes, 0);
        //     // if(actionBytes.length > 0) {
        //         actionItemBytes.set(actionBytes, actionLengthBytes.length);
        //     // }
        //     actionsItemsBytes = new Uint8Array([...actionsItemsBytes, ...actionItemBytes]);
        //     offset += actionBytes.length;
        // });

        // const actionsUint8Array = this.actions.toUint8Array();
        // const actionsTotalLengthUint8Array = varint.encodeVarInt(actionsUint8Array.length, 'uint8array');


        // resultBytes = new Uint8Array([...resultBytes, ...actionsTotalLengthUint8Array, ...actionsUint8Array]);
        // offset += actionsUint8Array.length;
        
        // const clustersLengthValueBytes = varint.encodeVarInt(this.clusters.length, 'uint8array');
        // resultBytes = new Uint8Array([...resultBytes, ...clustersLengthValueBytes]);
        // offset += clustersLengthValueBytes.length;

        // let clustersItemsBytes = new Uint8Array();
        // this.clusters.forEach(cluster => {
        //     const clusterMonikerBytes = uint8array.fromString(cluster[0]);
        //     const clusterMonikerByteLength = varint.encodeVarInt(cluster[0].length, 'uint8array');

        //     const clusterHashBytes = uint8array.fromHex(cluster[1]);
        //     const clusterHashByteLength = varint.encodeVarInt(cluster[1].length, 'uint8array');

        //     const clusterItemBytes = new Uint8Array(clusterMonikerByteLength.length + clusterMonikerBytes.length + clusterHashByteLength.length + clusterHashBytes.length);
        //     clusterItemBytes.set(clusterMonikerByteLength, 0);
        //     clusterItemBytes.set(clusterMonikerBytes, clusterMonikerByteLength.length);
        //     clusterItemBytes.set(clusterHashByteLength, clusterMonikerByteLength.length + clusterMonikerBytes.length);
        //     clusterItemBytes.set(clusterHashBytes, clusterMonikerByteLength.length + clusterMonikerBytes.length + clusterHashByteLength.length);
        //     clustersItemsBytes = new Uint8Array([...clustersItemsBytes, ...clusterItemBytes]);
        //     offset += clusterMonikerByteLength.length + clusterMonikerBytes.length + clusterHashByteLength.length + clusterHashBytes.length;
        // });


        // resultBytes = new Uint8Array([...resultBytes, ...clustersItemsBytes]);
        // offset += clustersItemsBytes.length;

        // return resultBytes;
    }

    toHash() {
        const uint8Array = this.toUint8Array();
        const hash = sha256(uint8Array);
        return uint8array.toHex(hash);
    }

    toJSON() {
        return {
            actions: this.actions,
            clusters: this.clusters,
        }
    }
}

export default RelayBlockPayload;
