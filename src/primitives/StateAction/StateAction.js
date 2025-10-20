import { Identity, Voucher, Transition, Transaction, Transfer, Asset, Instruction, RelayBlock, StateActionData, GovernanceProposal, GovernanceVote } from "../../index.js";
import { varint, uint8array } from "@scintilla-network/keys/utils";
import { NET_KINDS_ARRAY } from "../messages/NetMessage/NET_KINDS.js";

class StateAction { 
    constructor(element) {
        this.element = element;
    }

    static uint8ArrayToConstructor(uint8Array) {
        const kind = varint.decodeVarInt(uint8Array.subarray(0, 1));
        const kindString = NET_KINDS_ARRAY[kind.value];
        return StateAction.kindToConstructor(kindString);
    }

    static uint8ArrayToInstance(uint8Array) {
        const constructor = StateAction.uint8ArrayToConstructor(uint8Array);
        return constructor.fromUint8Array(uint8Array);
    }

    static kindToConstructor(kind) {
        switch(kind){
            case 'TRANSITION':
                return Transition;
            case 'TRANSACTION':
                return Transaction;
            case 'TRANSFER':
                return Transfer;
            case 'VOUCHER':
                return Voucher;
            case 'ASSET':
                return Asset;
            case 'IDENTITY':
                return Identity;
            case 'INSTRUCTION':
                return Instruction;
            case 'RELAYBLOCK':
                return RelayBlock;
            case 'STATEACTIONDATA':
                return StateActionData;
            case 'GOVERNANCEPROPOSAL':
                return GovernanceProposal;
            case 'GOVERNANCEVOTE':
                return GovernanceVote;
        default:
            throw new Error(`Unknown kind: ${kind}`);
        }
    }

    static fromHex(hex) {
        return StateAction.fromUint8Array(uint8array.fromHex(hex));
    }

    static fromJSON(json) {
        const constructor = StateAction.kindToConstructor(json.kind);
        const item = constructor.fromJSON(json);
        console.dir({fromJSON: item}, {depth: null});
        return new StateAction(item);
    }

    static fromUint8Array(uint8Array) {
        const constructor = StateAction.uint8ArrayToConstructor(uint8Array);
        return new StateAction(constructor.fromUint8Array(uint8Array));
    }

    toJSON() {
        return this.element?.toJSON();
    }

    toUint8Array() {
        return this.element?.toUint8Array();
    }

    toHex() {
        return this.element?.toHex();
    }

    toHash(encoding = 'uint8array') {
        return this.element?.toHash(encoding);
    }
}

export { StateAction };

export default StateAction;