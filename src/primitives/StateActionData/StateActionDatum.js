import { StateAction } from '../StateAction/StateAction.js';
import { varint } from '@scintilla-network/keys/utils';
import { llog } from '../../utils/llog.js';

class StateActionDatum {
    constructor(data) {
        if(!data?.kind) {
            return StateAction.kindToConstructor('INSTRUCTION').fromJSON({data: data});
        }
        if(data.kind) {
            const constructor = StateAction.kindToConstructor(data.kind);
            return new constructor(data);
        }

        return data;
    }

    toUint8Array() {
        return this.toUint8Array();
    }
    toJSON() {
        return this.toJSON();
    }
    toHex() {
        return this.toHex();
    }

    static fromUint8Array(data) {
        llog.log(`- StateActionDatum fromUint8Array: data`);
        return new StateActionDatum(StateAction.uint8ArrayToInstance(data));
    }

    static fromDataJSON(data) {
        if(!data.length) {
            return [];
        }
        return data.map(item => item.toJSON());
        // return (data?.length > 0) ? data.map(item => StateActionDatum.fromJSON(item)) : [];
        // return new StateActionDatum(StateAction.uint8ArrayToInstance(data));
    }

    static toDataJSON(data) {
        return data.map(item => {   
            llog.log(`- StateActionDatum toDataJSON: item`);
            return item.toJSON();
        });
    }


    static toDataUint8Array(data) {
        llog.log(`- StateActionDatum toDataUint8Array`);
        const dataAmountBytes = varint.encodeVarInt(data.length, 'uint8array');
        let dataBytes = new Uint8Array(0);

        for(let i = 0; i < data.length; i++) {
            let item = null;
            if(data[i] instanceof StateActionDatum){
                item = data[i];
            }else {
                item = new StateActionDatum(data[i]);
            }

            const itemBytes = item.toUint8Array();
            dataBytes = new Uint8Array([...dataBytes, ...itemBytes]);
        }

        const dataBytesLength = varint.encodeVarInt(dataBytes.length, 'uint8array');
        const totalLength = dataAmountBytes.length + dataBytesLength.length + dataBytes.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        result.set(dataAmountBytes, 0);offset += dataAmountBytes.length;
        result.set(dataBytesLength, offset);offset += dataBytesLength.length;
        result.set(dataBytes, offset);offset += dataBytes.length;
        return result;
    }

    static fromDataUint8Array(data) {
        const dataItems = [];
        let offset = 0;
        const {value: dataAmount, length: dataAmountBytesLength} = varint.decodeVarInt(data.subarray(offset));
        llog.log(`- StateActionDatum fromDataUint8Array. dataAmount: ${dataAmount}`);
        if(dataAmount === 0) {
            return [];
        }
        offset += dataAmountBytesLength;
        const {value: dataLength, length: dataLengthBytesLength} = varint.decodeVarInt(data.subarray(offset));
        offset += dataLengthBytesLength;
        for(let i = 0; i < dataAmount; i++) {
            const dataLengthBytes = data.subarray(offset, offset + dataLength);
            const dataItem = StateActionDatum.fromUint8Array(dataLengthBytes);
            llog.log(`- StateActionDatum fromDataUint8Array. dataItem: ${dataItem}`);
            llog.log({dataItem});
            dataItems.push(dataItem);
            offset += dataLength;
            llog.log(`- StateActionDatum fromDataUint8Array. offset: ${offset}`);
        }
        llog.log(`- StateActionDatum fromDataUint8Array. data: ${dataItems}`);
        return new StateActionDatum({data: dataItems});
    }
}

export { StateActionDatum };
export default StateActionDatum;