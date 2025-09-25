import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
import Transition from "../Transition/Transition.js";
import Transfer from "../Transfer/Transfer.js";
import Transaction from "../Transaction/Transaction.js";
import { Voucher } from "../Voucher/Voucher.js";
import GovernanceProposal from "../GovernanceProposal/GovernanceProposal.js";
import GovernanceVote from "../GovernanceVote/GovernanceVote.js";
// @ts-ignore
import {Tree} from "@truestamp/tree";
import { utils } from '@scintilla-network/keys';
import { NET_KINDS } from '../messages/NetMessage/NET_KINDS.js';
import { NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
const { uint8array, json, varint } = utils;
const { sortedJsonByKeyStringify } = json;
const { encodeVarInt, decodeVarInt } = varint;

class HashProofPayload {
    constructor(options) {
        this.data = [];
        if(options.data.length > 0) {
            for(const element of options.data) {
                if(typeof element.toUint8Array === 'function') {
                    this.data.push(element);
                } else {
                    // Then if it's a Uint8Array, we need to extract the kind from the first 2 bytes
                    const isUint8Array = element instanceof Uint8Array;
                    const kind = isUint8Array ? NET_KINDS_ARRAY[element.substring(0, 2)] : element.kind;
                    switch(kind) {
                        case 'TRANSACTION':
                            this.data.push( isUint8Array ? Transaction.fromUint8Array(element) : new Transaction(element));
                            break;
                        case 'TRANSITION':
                            this.data.push( isUint8Array ? Transition.fromUint8Array(element) : new Transition(element));
                            break;
                        case 'TRANSFER':
                            this.data.push( isUint8Array ? Transfer.fromUint8Array(element) : new Transfer(element));
                            break;  
                        case 'VOUCHER':
                            this.data.push( isUint8Array ? Voucher.fromUint8Array(element) : new Voucher(element));
                            break;
                        case 'GOVERNANCEPROPOSAL':
                            this.data.push( isUint8Array ? GovernanceProposal.fromUint8Array(element) : new GovernanceProposal(element));
                            break;
                        case 'GOVERNANCEVOTE':
                            this.data.push( isUint8Array ? GovernanceVote.fromUint8Array(element) : new GovernanceVote(element));
                            break;
                        default:
                            throw new Error(`Element is not a Uint8Array: ${kind} ${element}`);
                    }
                }
           
            }
        }
    }

    consider(element) {
        if (!element) {
            console.error('HashProofPayload tried to consider an undefined element.');
            return;
        }
        const { type, kind } = element;
        if (!type || !kind) {
            console.error('Element has no type or kind');
            return;
        }

        // Support all state action types
        const validKinds = ["TRANSACTION", "TRANSITION", "TRANSFER", "VOUCHER", "GOVERNANCEPROPOSAL", "GOVERNANCEVOTE"];
        if (validKinds.includes(kind)) {
            this.data.push(element);
            // Optimization: Consider sorting only when necessary, not on every insert
            if (this.data.length > 1) {
                // Assuming elements are mostly in order, insertion sort might be more efficient
                this.insertionSortByTimestamp(this.data);
            }
        } else {
            console.warn(`HashProofPayload: Unsupported element kind: ${kind}`);
        }
    }

    insertionSortByTimestamp(data) {
        for (let i = 1; i < data.length; i++) {
            let j = i;
            while (j > 0 && data[j - 1].timestamp > data[j].timestamp) {
                [data[j], data[j - 1]] = [data[j - 1], data[j]];
                j--;
            }
        }
    }

    toUint8Array() {
        if (this.data.length > 1_000_000) {
            throw new Error('Unusually large data');
        }

        // Encode the number of elements using varint
        const elementsLengthValueBytes = varint.encodeVarInt(this.data.length, 'uint8array');
        
        // Pre-calculate total size for better performance
        let totalElementsSize = 0;
        const serializedElements = [];
        
        this.data.forEach(element => {
            // Serialize each element using its own toUint8Array method
            try {
                element.toUint8Array();
            } catch (e) {
                console.error('Failed to serialize element:', e, element);
                throw new Error(`Failed to serialize element: ${e.message}`);
            }
            const elementBytes = element.toUint8Array();
            const elementLengthBytes = varint.encodeVarInt(elementBytes.length, 'uint8array');
            const elementWithLength = {
                lengthBytes: elementLengthBytes,
                contentBytes: elementBytes,
                totalSize: elementLengthBytes.length + elementBytes.length
            };
            
            serializedElements.push(elementWithLength);
            totalElementsSize += elementWithLength.totalSize;
        });

        // Create result array with exact size
        const totalLength = elementsLengthValueBytes.length + totalElementsSize;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        // Set elements count
        result.set(elementsLengthValueBytes, offset);
        offset += elementsLengthValueBytes.length;
        
        // Set each element with its length prefix
        serializedElements.forEach(element => {
            result.set(element.contentBytes, offset);
            offset += element.contentBytes.length;
        });
        
        return result;
    }

    toHash() {
        return uint8array.toHex(this.toUint8Array());
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return this.fromBuffer(uint8Array);
    }

    static fromUint8Array(inputArray) {
        try {
            let offset = 0;
            
            // Read the number of elements
            const {value: elementsLength, length: elementsLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
            offset += elementsLengthBytes;

            const reconstructedElements = [];
            
            for (let i = 0; i < elementsLength; i++) {
                // // Read element length
                // const {value: elementLength, length: elementLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
                // offset += elementLengthBytes;
                
                // // Extract element bytes
                // const elementBytes = inputArray.subarray(offset - elementLengthBytes, offset + elementLength);
                // offset += elementLength;
                
                const elementBytes = inputArray.subarray(offset);
                // Determine element kind by reading the first varint (NET_KINDS value)
                const {value: elementKindValue} = varint.decodeVarInt(elementBytes);
                const elementKind = NET_KINDS_ARRAY[elementKindValue];
                // Reconstruct the element based on its kind
                let element;
                switch (elementKindValue) {
                    case NET_KINDS['TRANSACTION']:
                        element = Transaction.fromUint8Array(elementBytes);
                        offset += elementBytes.length;
                        break;
                    case NET_KINDS['TRANSITION']:
                        element = Transition.fromUint8Array(elementBytes);
                        offset += elementBytes.length;
                        break;
                    case NET_KINDS['TRANSFER']:
                        element = Transfer.fromUint8Array(elementBytes);
                        offset += elementBytes.length;
                        break;
                    case NET_KINDS['VOUCHER']:
                        element = Voucher.fromUint8Array(elementBytes);
                        offset += elementBytes.length;
                        break;
                    case NET_KINDS['GOVERNANCEPROPOSAL']:
                        element = GovernanceProposal.fromUint8Array(elementBytes);
                        offset += elementBytes.length;
                        break;
                    case NET_KINDS['GOVERNANCEVOTE']:
                        element = GovernanceVote.fromUint8Array(elementBytes);
                        offset += elementBytes.length;
                        break;
                    default:    
                        throw new Error(`Unknown element kind: ${elementKind} - NET_KINDS: ${NET_KINDS_ARRAY[elementKindValue]}`);
                }
                
                reconstructedElements.push(element);
            }

            return new HashProofPayload({ data: reconstructedElements });
        } catch (e) {
            console.error('Failed to parse HashProofPayload from uint8Array:', e);
            throw new Error(`Failed to parse HashProofPayload from uint8Array: ${e.message} ${e.stack}`);
        }
    }

    toJSON() {
        return {
            data: this.data.map(element => element.toJSON()),
        };
    }

    /**
     * Validates individual elements in the payload
     */
    validateElements() {
        if (!this.data || this.data.length === 0) {
            return { valid: true }; // Empty payload is valid
        }

        for (let i = 0; i < this.data.length; i++) {
            const element = this.data[i];
            
            // Check if element exists and is an object
            if (!element || typeof element !== 'object') {
                return { valid: false, error: `Invalid payload element at index ${i}: not an object` };
            }

            // Check required properties
            if (!element.type || typeof element.type !== 'string') {
                return { valid: false, error: `Invalid payload element at index ${i}: missing or invalid type` };
            }

            const validKinds = ['TRANSACTION', 'TRANSITION', 'TRANSFER', 'VOUCHER', 'GOVERNANCE_PROPOSAL', 'GOVERNANCE_VOTE'];
            if (!element.kind || !validKinds.includes(element.kind)) {
                return { valid: false, error: `Invalid payload element at index ${i}: invalid kind "${element.kind}"` };
            }

            if (!Number.isInteger(element.timestamp) || element.timestamp <= 0) {
                return { valid: false, error: `Invalid payload element at index ${i}: invalid timestamp` };
            }

            // Check if element has required methods
            if (typeof element.isValid !== 'function') {
                return { valid: false, error: `Invalid payload element at index ${i}: missing isValid method` };
            }

            if (typeof element.toHash !== 'function') {
                return { valid: false, error: `Invalid payload element at index ${i}: missing toHash method` };
            }

            // Validate the element using its own isValid method
            const elementValidation = element.isValid();
            if (elementValidation && !elementValidation.valid && elementValidation.error) {
                return { valid: false, error: `Invalid payload element at index ${i}: ${elementValidation.error}` };
            }
        }

        return { valid: true };
    }

    /**
     * Validates timestamp ordering of elements
     */
    validateTimestampOrdering() {
        if (this.data.length <= 1) {
            return { valid: true };
        }

        for (let i = 1; i < this.data.length; i++) {
            if (this.data[i].timestamp < this.data[i - 1].timestamp) {
                return { 
                    valid: false, 
                    error: `Payload elements not properly ordered by timestamp at index ${i}` 
                };
            }
        }

        return { valid: true };
    }

    /**
     * Validates payload size constraints
     */
    validateSize() {
        const MAX_ELEMENTS = 10000;

        if (this.data.length > MAX_ELEMENTS) {
            return { valid: false, error: `Too many elements: ${this.data.length} exceeds maximum ${MAX_ELEMENTS}` };
        }

        try {
            // Size validation could be added here if needed
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { valid: false, error: `Failed to serialize payload: ${errorMessage}` };
        }

        return { valid: true };
    }

    /**
     * Computes the merkle root for the payload data
     */
    computeMerkleRoot(encoding = 'hex') {
        if (!this.data || this.data.length === 0) {
            return null;
        }

        try {
            let hashes;
            
            if (this.originalHashes && this.originalHashes.length === this.data.length) {
                // Use stored original hashes to avoid issues with element transformation
                hashes = this.originalHashes.map(hash => uint8array.fromHex(hash));
            } else {
                // Fallback to computing hashes from current elements
                hashes = this.data.map((element) => uint8array.fromHex(element.toHash()));
            }
            
            const tree = new Tree(hashes, 'sha256', {requireBalanced: false, debug: false});
            const root = tree.root();
            
            const proofs = hashes.map((hash) => {
                return {
                    hash: hash.toString('hex'),
                    proof: tree.proofObject(hash)
                }
            });

            return {hash: uint8array.toHex(new Uint8Array(root)), proofs};
        } catch (error) {
            return null;
        }
    }

    /**
     * Verifies that the computed merkle root matches the expected one
     */
    verifyMerkleRoot(expectedRoot) {
        if (!this.data || this.data.length === 0) {
            // Empty payload should have null merkle root
            if (expectedRoot !== null) {
                return { valid: false, error: 'Empty payload should have null merkle root' };
            }
            return { valid: true };
        }

        // Non-empty payload must have merkle root
        if (!expectedRoot) {
            return { valid: false, error: 'Merkle root is required when payload contains data' };
        }

        try {
            let hashes;
            
            if (this.originalHashes && this.originalHashes.length === this.data.length) {
                // Use stored original hashes to avoid issues with element transformation
                hashes = this.originalHashes.map(hash => uint8array.fromHex(hash));
            } else {
                // Fallback to computing hashes from current elements
                hashes = this.data.map((element) => uint8array.fromHex(element.toHash()));
            }

            const tree = new Tree(hashes, 'sha256', {requireBalanced: false, debug: false});
            const root = tree.root();
            const computedHash = uint8array.toHex(new Uint8Array(root));

            if (computedHash !== expectedRoot) {
                return { valid: false, error: `Merkle root mismatch: computed merkle root does not match expected root ${computedHash} !== ${expectedRoot}` };
            }

            return { valid: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { valid: false, error: `Failed to verify merkle root: ${errorMessage}` };
        }
    }

    /**
     * Comprehensive payload validation
     */
    isValid() {
        // 1. Validate individual elements
        const elementsValidation = this.validateElements();
        if (!elementsValidation.valid) {
            return elementsValidation;
        }

        // 2. Validate timestamp ordering
        const orderingValidation = this.validateTimestampOrdering();
        if (!orderingValidation.valid) {
            return orderingValidation;
        }

        // 3. Validate size constraints
        const sizeValidation = this.validateSize();
        if (!sizeValidation.valid) {
            return sizeValidation;
        }

        return { valid: true };
    }

    /**
     * Check if payload is empty
     */
    isEmpty() {
        return !this.data || this.data.length === 0;
    }

    /**
     * Get payload statistics
     */
    getStats() {
        const stats = {
            elementCount: this.data.length,
            size: 0,
            types: {}
        };

        try {
            stats.size = this.toUint8Array().length;
        } catch (error) {
            stats.size = -1;
        }

        this.data.forEach(element => {
            const key = `${element.kind}.${element.type}`;
            stats.types[key] = (stats.types[key] || 0) + 1;
        });

        return stats;
    }
}

export default HashProofPayload;

