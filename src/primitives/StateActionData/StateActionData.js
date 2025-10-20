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
import { Transition } from '../Transition/Transition.js';
import { RelayBlock } from '../RelayBlock/RelayBlock.js';

import { llog } from '../../utils/llog.js';

// function parseObjectItem(item) {
//     if(!item.kind) {
//         throw new Error('Item must have a kind');
//     }
//     switch(item.kind.toUpperCase()) {
//         case 'IDENTITY':
//             return Identity.fromJSON(item);
//             break;
//         case 'VOUCHER':
//             return Voucher.fromJSON(item);
//             break;
//         case 'GOVERNANCEPROPOSAL':
//             return GovernanceProposal.fromJSON(item);
//             break;
//         case 'GOVERNANCEVOTE':
//             return GovernanceVote.fromJSON(item);
//             break;
//         case 'TRANSFER':
//             return Transfer.fromJSON(item);
//             break;
//         case 'TRANSACTION':
//             return Transaction.fromJSON(item);
//             break;  
//         case 'TRANSITION':
//             return Transition.fromJSON(item);
//             break;
//         case 'INSTRUCTION':
//             return Instruction.fromJSON(item);
//             break;
//         case 'ASSET':
//             return Asset.fromJSON(item);
//             break;
//         case "RELAYBLOCK":
//             return RelayBlock.fromJSON(item);
//             break;
//         default:
//             throw new Error(`Unsupported item parseObjectItem kind: ${item.kind.toUpperCase()}`);
//     }
// };
// function parseUint8ArrayItem(item) {
//     const kind = varint.decodeVarInt(item.subarray(0, 1));
//     const kindString = NET_KINDS_ARRAY[kind.value];

//     switch(kindString.toUpperCase()) {
//         case 'IDENTITY':
//             return Identity.fromUint8Array(item);
//             break;
//         case 'VOUCHER':
//             return Voucher.fromUint8Array(item);
//             break;
//         case 'GOVERNANCEPROPOSAL':
//             return GovernanceProposal.fromUint8Array(item);
//             break;
//         case 'GOVERNANCEVOTE':
//             return GovernanceVote.fromUint8Array(item);
//             break;
//         case 'TRANSFER':
//             return Transfer.fromUint8Array(item);
//             break;
//         case 'TRANSACTION':
//             return Transaction.fromUint8Array(item);
//             break;  
//         case 'INSTRUCTION':
//             return Instruction.fromUint8Array(item);
//             break;
//         case 'TRANSITION':
//             return Transition.fromUint8Array(item);
//             break;
//         case 'ASSET':
//             return Asset.fromUint8Array(item);
//             break;
//         case "RELAYBLOCK":
//             return RelayBlock.fromUint8Array(item);
//             break;
//         default:
//             throw new Error(`Unsupported item parseUint8ArrayItem kind: ${kindString.toUpperCase()}`);
//     }
// }
// function parseItem(item) {
//     // If the item is a Uint8Array, we need to read for the kind part (first 2 bytes) to determine the kind
//     if(item instanceof Uint8Array) {
//         return parseUint8ArrayItem(item);
//     }
//     if(!item.kind) {
//         throw new Error('Item must have a kind');
//     }
//     if(item.kind !== item.constructor.name) {
//         return parseObjectItem(item);
//     }
//     return item;
// }


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


// function parseDataItem(item) {
//     const hasKind = !!item?.kind;
//     if(hasKind) {
//         return item;
//     } else {
//         return new Instruction({data: item});
//     }
// }


// function parseData(data) {
//     if(data instanceof Uint8Array) {
//         throw new Error('Uint8Array is not supported. Use StateActionData.fromUint8Array instead.');
//         // return parseUint8ArrayItem(data);
//     }
//     if(data instanceof Array) {
//         return data.map(parseDataItem);
//     }
//     return [parseDataItem(data)];
// }

// function parseItemFromUint8Array(itemBytes) {
//     const kind = varint.decodeVarInt(itemBytes.subarray(0, 1));
//     const kindString = NET_KINDS_ARRAY[kind.value];
//     switch(kindString.toUpperCase()) {
//         case 'IDENTITY':
//             return Identity.fromUint8Array(itemBytes);
//             break;
//         case 'VOUCHER':
//             return Voucher.fromUint8Array(itemBytes);
//             break;
//         case 'GOVERNANCEPROPOSAL':
//             return GovernanceProposal.fromUint8Array(itemBytes);
//             break;
//         case 'GOVERNANCEVOTE':
//             return GovernanceVote.fromUint8Array(itemBytes);
//             break;
//         case 'TRANSFER':
//             return Transfer.fromUint8Array(itemBytes);
//             break;
//         case 'TRANSACTION':
//             return Transaction.fromUint8Array(itemBytes);
//             break;  
//         case 'TRANSITION':
//             return Transition.fromUint8Array(itemBytes);
//             break;
//         case "RELAYBLOCK":
//             return RelayBlock.fromUint8Array(itemBytes);
//             break;
//         case 'ASSET':
//             return Asset.fromUint8Array(itemBytes);
//             break;
//         case 'INSTRUCTION':
//             return Instruction.fromUint8Array(itemBytes);
//             break;
//         default:
//             throw new Error(`Unsupported item parseUint8ArrayItem kind: ${kindString.toUpperCase()}`);
//     }
// }

import { StateAction } from '../StateAction/StateAction.js';

class StateActionData {
    constructor(data) {
        llog.log(`- StateActionData Constructor: data`);
        llog.log('data', data);
        this.kind = 'STATEACTIONDATA';
        
        if(data?.items && Array.isArray(data.items)) {
            this.items = data.items;
        } else if (data && Array.isArray(data)) {
            this.items = data;
        }
        else {
            this.items = data ? [data] : [];
        }

        // Ensure all items are loaded in their own instances
        this.items = this.items.map(item => {
            if(!item?.kind) {
                llog.log(`- StateActionData Constructor: item 1`);
                return StateAction.kindToConstructor('INSTRUCTION').fromJSON({data: item});
            }
            if(item.kind) {
                llog.log(`- StateActionData Constructor: item 2`);
                const constructor = StateAction.kindToConstructor(item.kind);
                llog.log(`- StateActionData Constructor: constructor`);
                llog.log(constructor);
                const instance = constructor.fromJSON(item);
                llog.log(`- StateActionData Constructor: instance`);
                const instance2 = new constructor(item);
                llog.log(`- StateActionData Constructor: instance2`);
                return instance2;
            }
            return item;
        });
        this.items = sort(this.items);


        llog.log(`- StateActionData Constructor: this.items`);
        llog.log(this.items);

    }

    static fromHex(hex) {
        return StateActionData.fromUint8Array(uint8array.fromHex(hex));
    }


    static fromJSON(json) {
        const items = [];
        if(!json.items || !json.items.forEach) {
            const e = new Error('No items found');
            console.error(e.stack);
            process.exit(0);
        }
        json.items.forEach(item => {
            try {
                const constructor = StateAction.kindToConstructor(item.kind);
                const instance = constructor.fromJSON(item);
                items.push(instance);
            } catch (e) {
                console.error('Failed to parse item:', e, item);
                throw new Error(`Failed to parse item: ${e.message}`);
            }
        });
        const actionData = new StateActionData({items: items, kind: 'STATEACTIONDATA'});
        return actionData;
    }

    static fromUint8Array(input) {
        llog.log('StateActionData fromUint8Array');
        llog.log({input});
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
            const item = StateAction.uint8ArrayToInstance(itemBytes);
            data.push(item);
            
        }
        llog.log('StateActionData fromUint8Array');
        return new StateActionData({items: data, kind: 'STATEACTIONDATA'});
    }

    push(item) {
        this.items.push(item);
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
            if(!item.toUint8Array) {
                llog.log({item});
                throw new Error('Item has no toUint8Array method');
            }
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

    getLength() {
        return this.toUint8Array().length;
    }

    toHash(encoding = 'uint8array', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    toHex() {
        const array = this.toUint8Array()
        return uint8array.toHex(array);
    }

    toJSON() {
        let items;
        try {
            items = this.items.map(item => item.toJSON());
        } catch (e) {
            console.dir(this, {depth: null});
            console.error('Failed to parse items:', e, this.items);
            throw new Error(`Failed to parse items: ${e.message}`);
        }
        return {
            kind: this.kind,
            items,
        };
    }

}

export { StateActionData };
export default StateActionData;