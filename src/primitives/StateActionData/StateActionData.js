import { sha256 } from '@scintilla-network/hashes/classic';
import { json, uint8array, varint } from '@scintilla-network/keys/utils';

import { NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';

import { Identity } from '../Identity/Identity.js';
import { Voucher } from '../Voucher/Voucher.js';

import { Transaction } from '../Transaction/Transaction.js';
import { Transfer } from '../Transfer/Transfer.js';

import { GovernanceProposal } from '../GovernanceProposal/GovernanceProposal.js';
import { GovernanceVote } from '../GovernanceVote/GovernanceVote.js';
import { Asset } from '../Asset/Asset.js';
import { Instruction } from '../Instruction/Instruction.js';

function parseObjectItem(item) {
    switch(item.kind.toUpperCase()) {
        case 'IDENTITY':
            return new Identity(item);
            break;
        case 'VOUCHER':
            return new Voucher(item);
            break;
        case 'GOVERNANCEPROPOSAL':
            return new GovernanceProposal(item);
            break;
        case 'GOVERNANCEVOTE':
            return new GovernanceVote(item);
            break;
        case 'TRANSFER':
            return new Transfer(item);
            break;
        case 'TRANSACTION':
            return new Transaction(item);
            break;  
        case 'INSTRUCTION':
            return new Instruction(item);
            break;
        default:
            throw new Error(`Unsupported item parseObjectItem kind: ${item.kind.toUpperCase()}`);
    }
};
function parseUint8ArrayItem(item) {
    const kind = varint.decodeVarInt(item.subarray(0, 1));
    const kindString = NET_KINDS_ARRAY[kind.value];

    switch(kindString.toUpperCase()) {
        case 'IDENTITY':
            return Identity.fromUint8Array(item);
            break;
        case 'VOUCHER':
            return Voucher.fromUint8Array(item);
            break;
        case 'GOVERNANCEPROPOSAL':
            return GovernanceProposal.fromUint8Array(item);
            break;
        case 'GOVERNANCEVOTE':
            return GovernanceVote.fromUint8Array(item);
            break;
        case 'TRANSFER':
            return Transfer.fromUint8Array(item);
            break;
        case 'TRANSACTION':
            return Transaction.fromUint8Array(item);
            break;  
        case 'INSTRUCTION':
            return Instruction.fromUint8Array(item);
            break;
        default:
            throw new Error(`Unsupported item parseUint8ArrayItem kind: ${kindString.toUpperCase()}`);
    }
}
function parseItem(item) {
    // If the item is a Uint8Array, we need to read for the kind part (first 2 bytes) to determine the kind
    if(item instanceof Uint8Array) {
        return parseUint8ArrayItem(item);
    }
    if(!item.kind) {
        throw new Error('Item must have a kind');
    }
    if(item.kind !== item.constructor.name) {
        return parseObjectItem(item);
    }
    return item;
}


function sort(unsortedData) {
    const sortedData = [];
    // When timestamp is provided, sort by timestamp.   
    const itemsWithTimestamp = unsortedData.filter(item => item?.item?.timestamp);
    const itemsWithoutTimestamp = unsortedData.filter(item => !item?.item?.timestamp);

    // If timestamp is not provided, depending on the kind (e.g: IDENTITY), it might need specific sorting.
    itemsWithTimestamp.sort((a, b) => a.timestamp - b.timestamp);
   
    // If timestamp is not provided, depending on the kind (e.g: IDENTITY), it might need specific sorting.
    itemsWithoutTimestamp.forEach(item => {
        if(item.kind === 'IDENTITY') {
            sortedData.push(item);
        }
        else {
            sortedData.push(item);
        }

    });

    sortedData.push(...itemsWithTimestamp);

    return sortedData;
}


function parseDataItem(item) {
    const hasKind = !!item?.kind;
    if(hasKind) {
        return item;
    } else {
        return new Instruction({data: item});
    }
}


function parseData(data) {
    if(data instanceof Uint8Array) {
        throw new Error('Uint8Array is not supported. Use StateActionData.fromUint8Array instead.');
        // return parseUint8ArrayItem(data);
    }
    if(data instanceof Array) {
        return data.map(parseDataItem);
    }
    return [parseDataItem(data)];
}

function parseItemFromUint8Array(itemBytes) {
    const kind = varint.decodeVarInt(itemBytes.subarray(0, 1));
    const kindString = NET_KINDS_ARRAY[kind.value];
    switch(kindString.toUpperCase()) {
        case 'IDENTITY':
            return Identity.fromUint8Array(itemBytes);
            break;
        case 'VOUCHER':
            return Voucher.fromUint8Array(itemBytes);
            break;
        case 'GOVERNANCEPROPOSAL':
            return GovernanceProposal.fromUint8Array(itemBytes);
            break;
        case 'GOVERNANCEVOTE':
            return GovernanceVote.fromUint8Array(itemBytes);
            break;
        case 'TRANSFER':
            return Transfer.fromUint8Array(itemBytes);
            break;
        case 'TRANSACTION':
            return Transaction.fromUint8Array(itemBytes);
            break;  
        case 'ASSET':
            return Asset.fromUint8Array(itemBytes);
            break;
        case 'INSTRUCTION':
            return Instruction.fromUint8Array(itemBytes);
            break;
        default:
            throw new Error(`Unsupported item parseUint8ArrayItem kind: ${kindString.toUpperCase()}`);
    }
}


class StateActionData {
    constructor(data) {

        this.kind = 'STATEACTIONDATA';
        if(data?.kind === 'STATEACTIONDATA') {
            this.items = data.items;
        }else if(data) {
            this.items = parseData(data);
        } else {
            this.items = [];
        }

        this.items = sort(this.items);
    }

    remove(item) {
        this.items = this.items.filter(i => i.item !== item);
    }

    sort() {
        this.items = sort(this.items);
        return this;
    }

    toUint8Array() {
        // Amount of items
        const itemsAmountValue = this.items.length;
        const itemsAmountValueBytes = varint.encodeVarInt(itemsAmountValue, 'uint8array');
        const itemsAmountBytesLength = itemsAmountValueBytes.length;



        // Items
        const itemsBytes = [];
        this.items.forEach(item => {
            const itemBytes = item.toUint8Array();
            const itemBytesLength = itemBytes.length;

            const itemBytesLengthValueBytes = varint.encodeVarInt(itemBytesLength, 'uint8array');
            const itemBytesLengthValueBytesLength = itemBytesLengthValueBytes.length;

            itemsBytes.push(...itemBytesLengthValueBytes);
            itemsBytes.push(...itemBytes);
        });

        const itemsBytesLengthValue = itemsBytes.length;
        const itemsBytesLengthValueBytes = varint.encodeVarInt(itemsBytesLengthValue, 'uint8array');
        const itemsBytesLengthValueBytesLength = itemsBytesLengthValueBytes.length;

        const totalLength = itemsAmountBytesLength + itemsBytesLengthValueBytesLength + itemsBytesLengthValue;

        const result = new Uint8Array(totalLength);
        result.set(itemsAmountValueBytes, 0);
        result.set(itemsBytesLengthValueBytes, itemsAmountBytesLength);
        result.set(itemsBytes, itemsAmountBytesLength + itemsBytesLengthValueBytesLength);
        return result;
    }

    static fromJSON(json) {
        return new StateActionData({items: json.items});
    }

    static fromUint8Array(input) {
        if(!(input instanceof Uint8Array)) {
            throw new Error('Input must be a Uint8Array - given:', input.constructor.name);
        }


        let offset = 0

        // Items amount is varint
        const itemsAmountValueBytes = varint.decodeVarInt(input.subarray(0, 1));
        
        const itemsAmountValue = itemsAmountValueBytes.value;
        const itemsAmountValueBytesLength = itemsAmountValueBytes.length;
        const itemsAmountBytesOffset = itemsAmountValueBytesLength;
        offset += itemsAmountValueBytesLength;



        // Items length is varint
        const itemsBytesLengthValueBytes = varint.decodeVarInt(input.subarray(offset));

        const itemsBytesLengthValue = itemsBytesLengthValueBytes.value;
        const itemsBytesLengthValueBytesLength = itemsBytesLengthValueBytes.length;
        offset += itemsBytesLengthValueBytesLength;

        const itemsBytes = input.slice(offset, offset + itemsBytesLengthValue);
        offset += itemsBytesLengthValue;
        const itemsBytesLength = itemsBytes.length;

        const data = [];
        let itemOffset = 0;
        for(let i = 0; i < itemsAmountValue; i++) {
            const itemBytesLengthValueBytes = varint.decodeVarInt(itemsBytes.subarray(itemOffset));
            const itemBytesLengthValue = itemBytesLengthValueBytes.value;
            const itemBytesLengthValueBytesLength = itemBytesLengthValueBytes.length;
            itemOffset += itemBytesLengthValueBytesLength;
            const itemBytes = itemsBytes.slice(itemOffset, itemOffset + itemBytesLengthValue);
            itemOffset += itemBytesLengthValue;
            const item = parseItemFromUint8Array(itemBytes);
            data.push(item);
            
        }
        return new StateActionData(data);
        


        // 1) Data total length bytes (varint)
        // 2) Data items amount (varint)
        // 3) Data items (each item is a Uint8Array starting with the kind part (varint))
        // 4) Data item via parseItem(item)
        // 5) Return new StateActionData(data)
        // const data = [];
        // let offset = 0;

        // const dataItemsAmountBytes = varint.decodeVarInt(input.subarray(offset));
        // offset += dataItemsAmountBytes.length;

        // for(let i = 0; i < dataItemsAmountBytes.value; i++) {
        //     // const itemLengthBytes = varint.decodeVarInt(input.subarray(offset));
        //     // offset += itemLengthBytes.length;
        //     // console.log('itemLengthBytes', itemLengthBytes);
        //     // console.log('itemLengthBytes', itemLengthBytes.value);
        //     // console.log('offset', offset);
        //     // console.log('input.subarray(offset, offset + itemLengthBytes.value)', input.slice(offset))

        //     const kind = varint.decodeVarInt(input.slice(offset));
        //     // offset += kind.length;
        //     const kindString = NET_KINDS_ARRAY[kind.value];
        //     if(kindString === 'STATEACTIONOBJECTITEM') {
        //         const item = StateActionObjectItem.fromUint8Array(input.slice(offset));
        //         data.push(item);
        //         offset += item.getLength();
        //     } else if(kindString === 'STATEACTIONITEM') {
        //         const item = StateActionItem.fromUint8Array(input.slice(offset));
        //         data.push(item);
        //         offset += item.getLength();
        //     } else {
        //         throw new Error(`Unsupported kind: ${kindString}`);
        //     }
        // }
        // return new StateActionData([data]);
    }

    getLength() {
        return this.toUint8Array().length;
    }

    static fromHex(hex) {
        return StateActionData.fromUint8Array(uint8array.fromHex(hex));
    }

    toHash(encoding = 'hex') {
        const hashArray = sha256(this.toUint8Array());
        return encoding === 'hex' ? uint8array.toHex(hashArray) : hashArray;
    }

    toHex() {
        const array = this.toUint8Array()
        return uint8array.toHex(array);
    }

    toJSON() {
        return {
            items: this.items.map(item => item.toJSON()),
        };
    }
}

export { StateActionData };
export default StateActionData;