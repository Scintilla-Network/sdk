// import { sha256 } from '@scintilla-network/hashes/classic';
import { varint, uint8array } from '@scintilla-network/keys/utils';

import { Instruction } from '../Instruction/Instruction.js';
import { NET_KINDS } from '../messages/NetMessage/NET_KINDS.js';
// function parseFees(data) {
//     if(data instanceof Uint8Array) {
//         return parseUint8ArrayFees(data);
//     }
//     return data;
// }
// function parseUint8ArrayFees(data) {
//     return StateActionFees.fromUint8Array(data);
// }

// function sort(items) {
//     // return items.sort((a, b) => a.item.localeCompare(b.item));
//     return items;
// }

class StateActionFee {
    constructor(data) {
        // this.kind = 'STATEACTIONFEE';
        // if(data?.kind === 'STATEACTIONFEE') {
        //     this.fee = data.fee;
        // }else if(data) {
        //     this.fee = parseFees(data);
        // } else {
        //     this.fee = [];
        // }
        Object.assign(this, data);
    }

    static fromFeesJSON(json) {
        const fees = [];
        if(!json.fees) {
            return fees;
        }
        json.fees.forEach(fee => {
            fees.push(new StateActionFee(fee));
        });
        return fees;
    }

    static fromFeesUint8Array(input) {
        const fees = [];
        let offset = 0;
        const {value: feesAmount, length: feesAmountBytes} = varint.decodeVarInt(input.subarray(offset));
        console.log(`- StateActionFee fromFeesUint8Array. feesAmount: ${feesAmount}`);
        if(feesAmount === 0) {
            console.log(`- StateActionFee fromFeesUint8Array. feesAmount: ${feesAmount}`);
            return fees;
        }
        offset += feesAmountBytes;
        const {value: feesLength, length: feesLengthBytesLength} = varint.decodeVarInt(input.subarray(offset));
        offset += feesLengthBytesLength;
        for(let i = 0; i < feesAmount; i++) {
            const feesLengthBytes = input.subarray(offset, offset + feesLength);
            const fee = StateActionFee.fromUint8Array(feesLengthBytes);
            fees.push(fee);
            offset += fee.toUint8Array().length;
        }
        console.log(`- StateActionFee fromFeesUint8Array. fees: ${fees}`);
        return fees;
    }

    static toFeesJSON(fees) {
        const feesJSON = [];
        fees.forEach(fee => {
            feesJSON.push(fee.toJSON());
        });
        return {
            fees: feesJSON,
        };
    }

    static toFeesUint8Array(fees) {
        const feesAmountBytes = varint.encodeVarInt(fees.length, 'uint8array');
        let feesBytes = new Uint8Array(0);
        for(let i = 0; i < fees.length; i++) {
            let fee = null;
            if(fees[i] instanceof StateActionFee){
                fee = fees[i];
            }else {
                fee = new StateActionFee(fees[i]);
            }

            const feeBytes = fee.toUint8Array();
            feesBytes = new Uint8Array([...feesBytes, ...feeBytes]);
        }

        const feesBytesLength = varint.encodeVarInt(feesBytes.length, 'uint8array');
        const totalLength = feesAmountBytes.length + feesBytesLength.length + feesBytes.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        result.set(feesAmountBytes, 0);offset += feesAmountBytes.length;
        result.set(feesBytesLength, offset);offset += feesBytesLength.length;
        result.set(feesBytes, offset);offset += feesBytes.length;
        return result;
    }

    static toFeesHex(fees) {
        return fees.map(fee => fee.toHex());
    }

    static fromFeesHex(hex) {
        return hex.map(fee => StateActionFee.fromHex(fee));
    }


    static fromUint8Array(input) {
        const array = new Uint8Array(input.length + 1);
        array.set(varint.encodeVarInt(NET_KINDS['INSTRUCTION'], 'uint8array'), 0);
        array.set(input, 1);
        console.log(array);
        const instruction = Instruction.fromUint8Array(array);
        return new StateActionFee(instruction.data);
    }

    static fromHex(hex) {
        return StateActionFee.fromUint8Array(uint8array.fromHex(hex));
    }

    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    toUint8Array() {
        const instruction = new Instruction({
            kind: 'INSTRUCTION',
            data: {
                ...this,
            },
        });
        console.log(instruction.toUint8Array());
        console.log(instruction.toUint8Array({ excludeKindPrefix: true }));
        return instruction.toUint8Array({ excludeKindPrefix: true });
    }


    toJSON() {
        return {
            ...this,
        };
    }

    // toUint8Array() {
    //     return this.fees.map(fee => fee.toUint8Array());
    // }

    // toJSON() {
    //     return this.fees.map(fee => fee.toJSON());
    // }

    // toHex() {
    //     return this.fees.map(fee => fee.toHex());
    // }


//     static fromJSON(json) {
//         return new StateActionFee({kind: json.kind, fee: json.fee});
//     }

//     static fromUint8Array(input) {
//         if(!(input instanceof Uint8Array)) {
//             throw new Error('Input must be a Uint8Array - given:', input.constructor.name);
//         }
//         let offset = 0

//         // Items amount is varint
//         const itemsAmountValueBytes = varint.decodeVarInt(input.subarray(0, 1));
//         const itemsAmountValue = itemsAmountValueBytes.value;
//         const itemsAmountValueBytesLength = itemsAmountValueBytes.length;
//         const itemsAmountBytesOffset = itemsAmountValueBytesLength;
//         offset += itemsAmountValueBytesLength;

//         // Items length is varint
//         const itemsBytesLengthValueBytes = varint.decodeVarInt(input.subarray(offset));

//         const itemsBytesLengthValue = itemsBytesLengthValueBytes.value;
//         const itemsBytesLengthValueBytesLength = itemsBytesLengthValueBytes.length;
//         offset += itemsBytesLengthValueBytesLength;

//         const itemsBytes = input.slice(offset, offset + itemsBytesLengthValue);
//         offset += itemsBytesLengthValue;
//         const itemsBytesLength = itemsBytes.length;

//         const data = [];
//         let itemOffset = 0;
//         for(let i = 0; i < itemsAmountValue; i++) {
//             const itemBytesLengthValueBytes = varint.decodeVarInt(itemsBytes.subarray(itemOffset));
//             const itemBytesLengthValue = itemBytesLengthValueBytes.value;
//             const itemBytesLengthValueBytesLength = itemBytesLengthValueBytes.length;
//             itemOffset += itemBytesLengthValueBytesLength;
//             const itemBytes = itemsBytes.slice(itemOffset, itemOffset + itemBytesLengthValue);
//             itemOffset += itemBytesLengthValue;
//             const item = parseItemFromUint8Array(itemBytes);
//             data.push(item);
            
//         }
//         return new StateActionFee(data);
//     }

//     static fromHex(hex) {
//         return StateActionFee.fromUint8Array(uint8array.fromHex(hex));
//     }

//     remove(item) {
//         this.fee = this.fee.filter(i => i.item !== item);
//     }

//     sort() {
//         this.fee = sort(this.fee);
//         return this;
//     }

//     toUint8Array() {
//         // Amount of items
//         const itemsAmountValue = this.fee.length;
//         const itemsAmountValueBytes = varint.encodeVarInt(itemsAmountValue, 'uint8array');
//         const itemsAmountBytesLength = itemsAmountValueBytes.length;

//         // Items
//         const itemsBytes = [];
//         this.fee.forEach(item => {
//             const itemBytes = item.toUint8Array();
//             const itemBytesLength = itemBytes.length;

//             const itemBytesLengthValueBytes = varint.encodeVarInt(itemBytesLength, 'uint8array');
//             const itemBytesLengthValueBytesLength = itemBytesLengthValueBytes.length;

//             itemsBytes.push(...itemBytesLengthValueBytes);
//             itemsBytes.push(...itemBytes);
//         });

//         const itemsBytesLengthValue = itemsBytes.length;
//         const itemsBytesLengthValueBytes = varint.encodeVarInt(itemsBytesLengthValue, 'uint8array');
//         const itemsBytesLengthValueBytesLength = itemsBytesLengthValueBytes.length;

//         const totalLength = itemsAmountBytesLength + itemsBytesLengthValueBytesLength + itemsBytesLengthValue;

//         const result = new Uint8Array(totalLength);
//         result.set(itemsAmountValueBytes, 0);
//         result.set(itemsBytesLengthValueBytes, itemsAmountBytesLength);
//         result.set(itemsBytes, itemsAmountBytesLength + itemsBytesLengthValueBytesLength);
//         return result;
//     }

//     getLength() {
//         return this.toUint8Array().length;
//     }


//     toHash(encoding = 'hex') {
//         const hashArray = sha256(this.toUint8Array());
//         return encoding === 'hex' ? uint8array.toHex(hashArray) : hashArray;
//     }

//     toHex() {
//         const array = this.toUint8Array()
//         return uint8array.toHex(array);
//     }

//     toJSON() {
//         return {
//             kind: this.kind,
//             items: this.items.map(item => item.toJSON()),
//         };
//     }

//     static fromFeesJSON(json) {
//         return new StateActionFee({kind: json.kind, items: json.items});
//     }

//     static fromFeesUint8Array(input) {
//         return StateActionFee.fromUint8Array(input);
//     }
}

export { StateActionFee };
export default StateActionFee;