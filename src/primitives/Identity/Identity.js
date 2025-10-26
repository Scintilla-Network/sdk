import { sha256 } from '@scintilla-network/hashes/classic';

import { json, uint8array, varint } from '@scintilla-network/keys/utils';
const { encodeVarInt, decodeVarInt } = varint;
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';
// Maximum length of a moniker is 64 characters
class Identity {
    /**
     * Create Identity
     * @param {Object} options - The options
     * @param {string} options.parent - The parent
     * @param {string} options.moniker - The moniker
     * @param {Object} options.records - The records
     * @param {Object[]} options.members - The members
     * @returns {Identity} The Identity instance
     */
    constructor(options = {}) {
        this.kind = 'IDENTITY';
        // very like we are trying to create a 'sct' parent, but null might be passed as value, so we need to check for undefined
        this.parent = options.parent || (options.parent === undefined ? 'sct' : null); // default parent is 'sct'
        this.moniker = this.setMoniker(options.moniker) || '';
        this.records = options.records || {};

        this.members = [];
        options.members?.forEach(member => this.setMember(member));
    }

    /**
     * Create Identity from JSON
     * @param {Object} json - The JSON object
     * @returns {Identity} The Identity instance
     */
    static fromJSON(json) {
        return new Identity({
            parent: json.parent,
            moniker: json.moniker,
            records: json.records,
            members: json.members
        });
    }

    /**
     * Create Identity from hex
     * @param {string} hex - The hex string
     * @returns {Identity} The Identity instance
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return Identity.fromUint8Array(uint8Array);
    }

    /**
     * Create Identity from Uint8Array
     * @param {Uint8Array} array - The Uint8Array
     * @returns {Identity} The Identity instance
     */
    static fromUint8Array(array) {
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(array.slice(offset));
        if(elementKind === NET_KINDS['IDENTITY']) {
            offset += elementKindLength;
        } else {
            // Reset offset if no valid NET_KINDS prefix found (backward compatibility)
            offset = 0;
        }

        // Kind
        const {value: kindLength, length: kindLengthLength} = decodeVarInt(array.slice(offset));
        offset += kindLengthLength;
        const kindArray = array.slice(offset, offset + kindLength);
        offset += kindLength;

        // Parent
        const {value: parentLength, length: parentLengthLength} = decodeVarInt(array.slice(offset));
        offset += parentLengthLength;
        const parentArray = array.slice(offset, offset + parentLength);
        offset += parentLength;

        // Moniker
        const {value: monikerLength, length: monikerLengthLength} = decodeVarInt(array.slice(offset));
        offset += monikerLengthLength;
        const monikerArray = array.slice(offset, offset + monikerLength);
        offset += monikerLength;

        // Records
        const {value: recordsLength, length: recordsLengthLength} = decodeVarInt(array.slice(offset));
        offset += recordsLengthLength;
        const recordsArray = array.slice(offset, offset + recordsLength);
        offset += recordsLength;

        // Members
        const {value: membersLength, length: membersLengthLength} = decodeVarInt(array.slice(offset));
        offset += membersLengthLength;
        const membersArray = array.slice(offset, offset + membersLength);

        return new Identity({
            parent: uint8array.toString(parentArray),
            moniker: uint8array.toString(monikerArray),
            records: json.parse(uint8array.toString(recordsArray)),
            members: json.parse(uint8array.toString(membersArray))
        });
    }

    /**
     * Set the moniker
     * @param {string} moniker - The moniker
     * @returns {string} The moniker
     */
    setMoniker(moniker) {
        const monikerRegex = /^[a-z0-9_-]+$/;
        // If moniker is alphanumeric, hyphens, or underscores and not exceed 64 characters
        // Due to the way identity can transact, null parent and 'sct...' moniker are not allowed.
        // For now, the whole 'parent' field is limited for now.
        if (moniker && moniker.match(monikerRegex)) {
            return moniker.substring(0, 64);
        }
        // If moniker contains dots, and parent is not set, split the moniker
        if (moniker && moniker.includes('.')) {
            const parts = moniker.split('.');
            const monikerPart = parts[parts.length - 1];
            const parentParts = parts.slice(0, -1).join('.');
            if(!monikerPart.match(monikerRegex)) {
                throw new Error(`Moniker must be alphanumeric, hyphens, or underscores and not exceed 64 characters - ${monikerPart}`);
            }
            // Can have multiple levels of parent (e.g. parent.parent.moniker - dot separated so we allow dots in parent)
            if(!parentParts.match(monikerRegex)) {
                throw new Error(`Parent moniker must be alphanumeric, hyphens, or underscores and not exceed 64 characters - ${parentParts}`);
            }

            if(this.parent) {
                // Check if parent is set and matches the parent in the moniker
                if(this.parent !== parentParts) {
                    console.warn(`Parent moniker does not match moniker - ${this.parent} !== ${parentParts} - overwriting parent to ${parentParts}`);
                }
            }
            this.parent = parentParts;
            return monikerPart.substring(0, 64);
        }

        throw new Error(`Moniker must be alphanumeric, hyphens, or underscores and not exceed 64 characters - ${moniker}`);
    }

    /**
     * Get a member
     * @param {string} identifier - The identifier
     * @returns {Object} The member
     */
    getMember(identifier) {
        const findMember = this.members.find(member => member[0] === identifier);
        if (findMember) {
            const [identifier, ownerWeight, spendWeight, stakeWeight, proposeWeight, voteWeight, operateWeight] = findMember;
            return [identifier, ownerWeight, spendWeight, stakeWeight, proposeWeight, voteWeight, operateWeight];
        }
        return null;
    }

    /**
     * Set a member
     * @param {Object} member - The member
     */
    setMember(member) {
        // We are still pondering if we should reinitiate the non-voting power down below.
        // It has the equivalent of a distribution value (no right, but still involved to distribution of rewards - such as a stakeWeight not a stakePermitWeight)
        // Every value down velow will now be used as a PermitWeight in certain cases (permit to vote, permit to propose, permit to operate, while that non-voting power is more an entitlement to a share of the rewards)
        // For now, we will intend that a records['clusters']['core.banking']['stake'] can be used instead.

        // member is [identifier, ownerWeight, spendWeight, stakeWeigth, proposeWeight, voteWeight, operateWeight]
        let [ identifier, ownerWeight, spendWeight, stakeWeight, proposeWeight, voteWeight, operateWeight] = member;

        const findMember = this.members.find(member => member[0] === identifier);

        // Member weights are always positive numbers and are optionals. If specific not set, it is equals to the previous set value. If none set, it is equals to 1.
        // and that powers are always positive numbers
        // pubkey = pubkey ? pubkey : findMember ? findMember[1] : '';
        ownerWeight = ownerWeight ? Math.abs(ownerWeight) : findMember ? findMember[1] : 0;
        spendWeight = spendWeight ? Math.abs(spendWeight) : findMember ? findMember[2] : 0;
        stakeWeight = stakeWeight ? Math.abs(stakeWeight) : findMember ? findMember[3] : 0;
        proposeWeight = proposeWeight ? Math.abs(proposeWeight) : findMember ? findMember[4] : 0;
        voteWeight = voteWeight ? Math.abs(voteWeight) : findMember ? findMember[5] : 0;
        operateWeight = operateWeight ? Math.abs(operateWeight) : findMember ? findMember[6] : 0;

        if (findMember) {
            this.members.splice(this.members.indexOf(findMember), 1, [identifier, ownerWeight, spendWeight, stakeWeight, proposeWeight, voteWeight, operateWeight]);
        } else {
            this.members.push([identifier, ownerWeight, spendWeight, stakeWeight, proposeWeight, voteWeight, operateWeight]);
        }
        // Normalize that member are always sorted by identifier
        this.members.sort((a, b) => a[0].localeCompare(b[0]));
    }

    /**
     * Set a record
     * @param {string} key - The key
     * @param {any} value - The value
     */
    setRecord(key, value) {
        const keys = key.split('.');
        let current = this.records;

        // Navigate/create structure for nested keys
        keys.slice(0, -1).forEach(part => {
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        });

        // Set value at the correct location
        current[keys[keys.length - 1]] = value;
    }

    /**
     * Get the full moniker
     * @returns {string} The full moniker
     */
    getFullMoniker() {
        return this.parent ? `${this.parent}.${this.moniker}` : this.moniker;
    }

    /**
     * Convert to store
     * @returns {Object} The store
     */
    toStore() {
        const store = {};

        // Store in .identity all but childs to which we only pin the moniker as a list.
        // Childs are stored in their own files
        store[`/${this.getFullMoniker()}/.identity.json`] = JSON.stringify(this);

        return store;
    }

    /**
     * Get the moniker
     * @returns {string} The moniker
     */
    getMoniker() {
        return this.getFullMoniker();
    }

    /**
     * Convert to JSON
     * @returns {Object} The JSON object
     */
    toJSON() {
        return {
            kind: this.kind,
            parent: this.parent,
            moniker: this.moniker,
            members: this.members,
            records: this.records,
        };
    }

    /**
     * Convert to Uint8Array
     * @param {Object} options - The options
     * @param {boolean} options.excludeKindPrefix - Whether to exclude the kind prefix
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array(options = {}) {
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['IDENTITY'], 'uint8array');

        const kindUint8Array = uint8array.fromString(this.kind);
        const varIntKindLength = encodeVarInt(kindUint8Array.length);

        const parentUint8Array = uint8array.fromString(this.parent || '');
        const varIntParentLength = encodeVarInt(parentUint8Array.length);

        const monikerUint8Array = uint8array.fromString(this.moniker);
        const varIntMonikerLength = encodeVarInt(monikerUint8Array.length);
        
        const recordsUint8Array = uint8array.fromString(json.sortedJsonByKeyStringify(this.records));
        const varIntRecordsLength = encodeVarInt(recordsUint8Array.length);

        const membersUint8Array = uint8array.fromString(json.sortedJsonByKeyStringify(this.members));
        const varIntMembersLength = encodeVarInt(membersUint8Array.length);

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
            + varIntKindLength.length + kindUint8Array.length 
            + varIntParentLength.length + parentUint8Array.length 
            + varIntMonikerLength.length + monikerUint8Array.length 
            + varIntRecordsLength.length + recordsUint8Array.length 
            + varIntMembersLength.length + membersUint8Array.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }
        result.set(varIntKindLength, offset); offset += varIntKindLength.length;
        result.set(kindUint8Array, offset); offset += kindUint8Array.length;
        result.set(varIntParentLength, offset); offset += varIntParentLength.length;
        result.set(parentUint8Array, offset); offset += parentUint8Array.length;
        result.set(varIntMonikerLength, offset); offset += varIntMonikerLength.length;
        result.set(monikerUint8Array, offset); offset += monikerUint8Array.length;
        result.set(varIntRecordsLength, offset); offset += varIntRecordsLength.length;
        result.set(recordsUint8Array, offset); offset += recordsUint8Array.length;
        result.set(varIntMembersLength, offset); offset += varIntMembersLength.length;
        result.set(membersUint8Array, offset); offset += membersUint8Array.length;

        return result;
    }

    /**
     * Convert to hex
     * @returns {string} The hex string
     */
    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    /**
     * Convert to hash
     * @param {string} encoding - The encoding
     * @returns {string} The hash
     */
    toHash(encoding = 'uint8array') {
        const uint8Array = this.toUint8Array();
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

}

export { Identity };
export default Identity;

