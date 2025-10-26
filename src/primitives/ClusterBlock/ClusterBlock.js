import { uint8array, varint } from '@scintilla-network/keys/utils';
import { sha256 } from '@scintilla-network/hashes/classic';
import { SignableMessage } from "@scintilla-network/keys";
import Logger from 'hermodlog';

import {ClusterBlockHeader} from "./ClusterBlockHeader.js";
import {ClusterBlockPayload} from "./ClusterBlockPayload.js";
import { Authorization } from "../Authorization/Authorization.js";
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';

const VALID_STATE_ACTIONS_KIND = ['TRANSFER', "TRANSACTION", "TRANSITION", "VOUCHER", "GOVERNANCE_PROPOSAL", "GOVERNANCE_VOTE"];
const VALID_ELEMENT_KINDS = ['HASHPROOF', ...VALID_STATE_ACTIONS_KIND];

class ClusterBlock {
    /**
     * Create ClusterBlock
     * @param {Object} options - The options
     * @param {string} options.cluster - The cluster
     * @param {Object} options.header - The header
     * @param {Object} options.payload - The payload
     * @param {Authorization[]} options.authorizations - The authorizations
     * @returns {ClusterBlock} The ClusterBlock instance
     */
    constructor(options = {}) {
        this.kind = 'CLUSTERBLOCK';
        this.version = 1;
        this.cluster = options.cluster ?? '';

        this.header = new ClusterBlockHeader(options.header);
        this.payload = new ClusterBlockPayload(options.payload);
        this.authorizations = Authorization.fromAuthorizationsJSON({ authorizations: options.authorizations });
    }

    /**
     * Create ClusterBlock from hex string
     * @param {string} hex - The hex string
     * @returns {ClusterBlock} The ClusterBlock instance
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return this.fromUint8Array(uint8Array);
    }

    /**
     * Create ClusterBlock from Uint8Array
     * @param {Uint8Array} inputArray - The Uint8Array
     * @returns {ClusterBlock} The ClusterBlock instance
     */
    static fromUint8Array(inputArray) {
        let offset = 0;

        const {value: elementKind, length: elementKindBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindBytes;
        if(elementKind !== NET_KINDS['CLUSTERBLOCK']) {
            throw new Error(`Invalid element kind: ${elementKind}(${NET_KINDS_ARRAY[elementKind]}) - Expected: ${NET_KINDS['CLUSTERBLOCK']}(CLUSTERBLOCK)`);
        }
        const {value: version, length: versionBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += versionBytes;
        if(version !== 1) {
            throw new Error(`Invalid version: ${version} - Expected: 1`);
        }   

        // Cluster
        const {value: clusterLength, length: clusterLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += clusterLengthBytes;
        const cluster = uint8array.toString(inputArray.subarray(offset, offset + clusterLength));
        offset += clusterLength;

        const {value: headerLength, length: headerLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += headerLengthBytes;

        const headerUint8Array = inputArray.slice(offset, offset + headerLength);
        const header = ClusterBlockHeader.fromUint8Array(headerUint8Array);
        offset += headerLength;

        const {value: payloadLength, length: payloadLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += payloadLengthBytes;

        const payloadUint8Array = inputArray.slice(offset, offset + payloadLength);
        const payload = ClusterBlockPayload.fromUint8Array(payloadUint8Array);
        offset += payloadLength;

        // Authorizations
        const authorizations = Authorization.fromAuthorizationsUint8Array(inputArray.subarray(offset));

        return new ClusterBlock({
            cluster,
            header: header.toJSON(),
            payload: payload.toJSON(),
            authorizations,
        });
    }

    /**
     * Create ClusterBlock from JSON
     * @param {Object} json - The JSON object
     * @returns {ClusterBlock} The ClusterBlock instance
     */
    static fromJSON(json) {
        const instance = new ClusterBlock({
            ...json,
            header: ClusterBlockHeader.fromJSON(json.header),
            payload: ClusterBlockPayload.fromJSON(json.payload),
        });
        return instance;
    }
    
    /**
     * Convert to hex string
     * @returns {string} The hex string
     */
    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }


    /**
     * Consider an element
     * @param {Object} element - The element to consider
     * @returns {boolean} True if the element was considered
     */
    consider(element) {
        if (!element) {
            console.error('Block tried to consider an undefined element.');
            return false;
        }
        const logger = new Logger().context('ClusterBlock').method('consider');
        logger.log(`Considering element`, element.constructor.name);

        // Handle different element types
        if (element.kind === 'HASHPROOF') {
            return this.considerHashProof(element);
        } else {
            return this.considerStateAction(element);
        }
    }

    /**
     * Consider a HashProof
     * @param {Object} hashProof - The HashProof to consider
     * @returns {boolean} True if the HashProof was considered
     */
    considerHashProof(hashProof) {
        const logger = new Logger().context('ClusterBlock').method('considerHashProof');
        logger.log(`Considering HashProof with ${hashProof.payload.data.length} elements`);

        if (hashProof.cluster !== this.cluster) {
            throw new Error(`HashProof cluster ${hashProof.cluster} does not match block cluster ${this.cluster}`);
        }

        if (!hashProof.payload || !hashProof.payload.data) {
            throw new Error('HashProof has no payload data');
        }

        const hash = hashProof.toHash('hex');
        
        // Consider each state action within the HashProof
        hashProof.payload.data.forEach((stateAction, index) => {
            if (!stateAction.kind) {
                throw new Error('State action has no kind');
            }
            if (!VALID_STATE_ACTIONS_KIND.includes(stateAction.kind)) {
                throw new Error(`Invalid state action kind ${stateAction.kind}`);
            }

            const {type, timestamp} = stateAction;
            const key = `${timestamp}:${type}:${hash}:${index}`;
            logger.log(`Considering HashProof state action key ${key}`);
            this.payload.consider(key);
        });

        return true;
    }

    /**
     * Consider a state action
     * @param {Object} element - The state action to consider
     * @returns {boolean} True if the state action was considered
     */
    considerStateAction(element) {
        const logger = new Logger().context('ClusterBlock').method('considerStateAction');
        logger.log(`Considering state action ${element.kind}`);

        if (element.header && element.cluster !== this.cluster) {
            throw new Error(`Element cluster ${element.cluster} does not match block cluster ${this.cluster}`);
        }

        if (!element.kind) {
            throw new Error('State action has no kind');
        }
        if (!VALID_STATE_ACTIONS_KIND.includes(element.kind)) {
            throw new Error(`Invalid state action kind ${element.kind}`);
        }

        const hash = element.toHash('hex');
        const {type, timestamp} = element;
        const key = `${timestamp}:${type}:${hash}:0`;
        logger.log(`Considering state action key ${key}`);
        this.payload.consider(key);

        return true;
    }

   
    /**
     * Convert to Uint8Array
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude authorizations
     * @param {boolean} options.excludeKindPrefix - Whether to exclude the kind prefix
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array(options = {}) {
        if(options.excludeAuthorizations === undefined) {
            options.excludeAuthorizations = false;
        }
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const elementKindUint8Array = varint.encodeVarInt(NET_KINDS['CLUSTERBLOCK'], 'uint8array');
        const versionUint8Array = varint.encodeVarInt(this.version, 'uint8array');

        const clusterUint8Array = uint8array.fromString(this.cluster);
        const clusterLengthUint8Array = varint.encodeVarInt(clusterUint8Array.length, 'uint8array');

        const headerUint8Array = this.header.toUint8Array();
        const headerLengthUint8Array = varint.encodeVarInt(headerUint8Array.length, 'uint8array');

        const payloadUint8Array = this.payload.toUint8Array();
        const payloadLengthUint8Array = varint.encodeVarInt(payloadUint8Array.length, 'uint8array');

        let authorizationsUint8Array = new Uint8Array();
        if(options.excludeAuthorizations === false) {
            authorizationsUint8Array = Authorization.toAuthorizationsUint8Array(this.authorizations);
        }

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length) 
        + versionUint8Array.length 
        + clusterLengthUint8Array.length + clusterUint8Array.length 
        + headerLengthUint8Array.length + headerUint8Array.length 
        + payloadLengthUint8Array.length + payloadUint8Array.length 
        + (options.excludeAuthorizations === true ? 0 : authorizationsUint8Array.length);

        const result = new Uint8Array(totalLength);

        let offset = 0;
        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }
        result.set(versionUint8Array, offset); offset += versionUint8Array.length;
        result.set(clusterLengthUint8Array, offset); offset += clusterLengthUint8Array.length;
        result.set(clusterUint8Array, offset); offset += clusterUint8Array.length;  
        result.set(headerLengthUint8Array, offset); offset += headerLengthUint8Array.length;
        result.set(headerUint8Array, offset); offset += headerUint8Array.length;
        result.set(payloadLengthUint8Array, offset); offset += payloadLengthUint8Array.length;
        result.set(payloadUint8Array, offset); offset += payloadUint8Array.length;
        if(options.excludeAuthorizations !== true) {
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }
        return result;
    }

    /**
     * Convert to hash
     * @param {string} encoding - The encoding
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude authorizations
     * @returns {string} The hash
     */
    toHash(encoding = 'uint8array', {excludeAuthorizations = false} = {}) {
        const uint8Array = this.toUint8Array({excludeAuthorizations});
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'uint8array' ? hashUint8Array : uint8array.toHex(hashUint8Array);
    }

    /**
     * Convert to string
     * @returns {string} The string
     */
    toString() {
        return uint8array.toHex(this.toUint8Array());
    }
  
    /**
     * Convert to JSON
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude authorizations
     * @returns {Object} The JSON object
     */
    toJSON({excludeAuthorizations = false} = {}) {
        const obj = {
            kind: this.kind,
            version: this.version,
            cluster: this.cluster,
            header: this.header.toJSON(),
            payload: this.payload.toJSON(),
        };

        if (excludeAuthorizations === false) {
            obj['authorizations'] = Authorization.toAuthorizationsJSON(this.authorizations);
        }

        return obj;
    }

    /**
     * Check if the block is frozen
     * @returns {boolean} True if the block is frozen
     */
    isFrozen() {
        // Placeholder for isFrozen logic
        return false;
    }

    /**
     * Check if the block is open
     * @returns {boolean} True if the block is open
     */
    isOpen() {
        // return true if block is between timestamp - 1m and timestamp -7 s
        return new Date().getTime() - this.header.timestamp < 60000 && !this.isFrozen() && !this.isVoting();
    }

    /**
     * Check if the block is voting
     * @returns {boolean} True if the block is voting
     */
    isVoting() {
        // return true if block is between timestamp - 5s and timestamp
        return new Date().getTime() - this.header.timestamp < 5000;
    }

    /**
     * Convert to SignableMessage
     * @param {Object} options - The options
     * @param {boolean} options.excludeAuthorizations - Whether to exclude authorizations
     * @returns {SignableMessage} The SignableMessage
     */
    toSignableMessage({excludeAuthorizations = false} = {}) {
        return new SignableMessage(this.toHex({excludeAuthorizations}));
    }

    /**
     * Add an authorization
     * @param {Object} authorization - The authorization to add
     * @returns {void}
     */
    addAuthorization(authorization) {
        if(authorization.signature === '' || authorization.signature === undefined){
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.push(authorization);
    }

    /**
     * Verify the authorizations
     * @returns {boolean} True if the authorizations are valid
     */
    verifyAuthorizations() {
        return this.authorizations.every(auth => auth.verify(this).valid);
    }

    /**
     * Sign the block
     * @param {Object} signer - The signer
     * @returns {ClusterBlock} The signed block
     */
    async sign(signer) {
        let authorization = new Authorization();
        const existingAuthorization = this.authorizations.find(auth => auth.moniker === signer.getMoniker());
        if(existingAuthorization){
            this.authorizations.splice(this.authorizations.indexOf(existingAuthorization), 1);
        }
        authorization = await authorization.sign(this, signer, true);
        this.authorizations.push(authorization);
        return this;
    }

    /**
     * Validate the block
     * @returns {Object} The validation result
     */
    validate() {
        if (!this.authorizations) return {valid: false, error: 'Authorizations are required.'};

        const signedAuthorizations = this.authorizations.filter(authorization => authorization.signature);
        if (!signedAuthorizations.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedAuthorizations.filter(authorization => authorization.publicKey);
        if(authWithPublicKey.length < 0) return {valid: false, error: 'At least one authorization with public key is required.'};

        // proposer has signed the block
        const proposerAuthorization = this.authorizations.find(authorization => authorization.moniker === this.header.proposer);
        if(!proposerAuthorization) return {valid: false, error: 'Proposer authorization is required.'};

        if (!this.verifyAuthorizations()) return {valid: false,error: 'Invalid authorization.'};
        return {valid: true, error: ''};
    }

    /**
     * Check if the block is valid
     * @returns {boolean} True if the block is valid
     */
    isValid() {
        const logger = new Logger().context('ClusterBlock').method('isValid');
        logger.log('Checking if block is valid...');
        const {valid} = this.validate();
        return valid;
    }
}

export { ClusterBlock };
export default ClusterBlock;