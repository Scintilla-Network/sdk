import {ClusterBlockPayload} from "./ClusterBlockPayload.js";
import {ClusterBlockHeader} from "./ClusterBlockHeader.js";
import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
//@ts-ignore
import Logger from 'hermodlog';
import { SignableMessage, utils } from "@scintilla-network/keys";
const { uint8array, varint } = utils;
const { decodeVarInt, encodeVarInt } = varint;
import makeDoc from "../../utils/makeDoc.js";
// import signDoc from "../../utils/signDoc.js";
//  import verifyDoc from "../../utils/verifyDoc.js";
// import HashProof from "../HashProof/HashProof.js";
import { Authorizations } from "../Authorizations/Authorizations.js";
import { Authorization } from "../Authorization/Authorization.js";

const VALID_STATE_ACTIONS_KIND = ['TRANSFER', "TRANSACTION", "TRANSITION", "VOUCHER", "GOVERNANCE_PROPOSAL", "GOVERNANCE_VOTE"];
const VALID_ELEMENT_KINDS = ['HASHPROOF', ...VALID_STATE_ACTIONS_KIND];

class ClusterBlock {
    constructor(options = {}) {
        const headerOptions = options.header || {};
        this.header = new ClusterBlockHeader(headerOptions);

        const payloadOptions = options.payload || {};
        this.payload = new ClusterBlockPayload(payloadOptions);

        this.authorizations = new Authorizations(options.authorizations);
    }

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

    considerHashProof(hashProof) {
        const logger = new Logger().context('ClusterBlock').method('considerHashProof');
        logger.log(`Considering HashProof with ${hashProof.payload.data.length} elements`);

        if (hashProof.header.cluster !== this.header.cluster) {
            throw new Error(`HashProof cluster ${hashProof.header.cluster} does not match block cluster ${this.header.cluster}`);
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

    considerStateAction(element) {
        const logger = new Logger().context('ClusterBlock').method('considerStateAction');
        logger.log(`Considering state action ${element.kind}`);

        if (element.header && element.header.cluster !== this.header.cluster) {
            throw new Error(`Element cluster ${element.header.cluster} does not match block cluster ${this.header.cluster}`);
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

    toUint8Array({excludeAuthorizations = false} = {}) {
        const headerUint8Array = this.header.toUint8Array();
        const varintHeaderUint8Array = encodeVarInt(headerUint8Array.length);

        const payloadUint8Array = this.payload.toUint8Array();
        const varintPayloadUint8Array = encodeVarInt(payloadUint8Array.length);

        const authorizationsUint8Array = this.authorizations.toUint8Array();

        const baseLength = varintHeaderUint8Array.length + headerUint8Array.length + varintPayloadUint8Array.length + payloadUint8Array.length + (excludeAuthorizations ? 0 : authorizationsUint8Array.length);

        const result = new Uint8Array(baseLength);
        let offset = 0;
        result.set(varintHeaderUint8Array, offset); offset += varintHeaderUint8Array.length;
        result.set(headerUint8Array, offset); offset += headerUint8Array.length;
        result.set(varintPayloadUint8Array, offset); offset += varintPayloadUint8Array.length;
        result.set(payloadUint8Array, offset); offset += payloadUint8Array.length;
        if(!excludeAuthorizations){
            result.set(authorizationsUint8Array, offset); offset += authorizationsUint8Array.length;
        }
        return result;
    }

    /**
     * @deprecated Use toUint8Array instead
     */
    toBuffer({excludeAuthorizations = false} = {}) {
        return this.toUint8Array({excludeAuthorizations});
    }

    toHex({excludeAuthorizations = false} = {}) {
        return uint8array.toHex(this.toUint8Array({excludeAuthorizations}));
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return this.fromUint8Array(uint8Array);
    }

    static fromUint8Array(inputArray) {
        const uint8Array = inputArray instanceof Uint8Array ? inputArray : new Uint8Array(inputArray);
        let offset = 0;
        const {
            length: headerLengthBytes,
            value: headerLengthValue        
        } = decodeVarInt(uint8Array);

        offset += headerLengthBytes;
        const headerUint8Array = uint8Array.slice(offset, offset + Number(headerLengthValue));
        offset += Number(headerLengthValue);

        const {
            length: payloadLengthBytes,
            value: payloadLengthValue
        } = decodeVarInt(uint8Array.slice(offset));
        offset += payloadLengthBytes;

        const payloadUint8Array = uint8Array.slice(offset, offset + Number(payloadLengthValue));
        offset += Number(payloadLengthValue);

        const header = ClusterBlockHeader.fromUint8Array(headerUint8Array);
        const payload = ClusterBlockPayload.fromUint8Array(payloadUint8Array);

        let authorizations = null;
        if (offset < uint8Array.length) {
            const authorizationsUint8Array = uint8Array.slice(offset);
            authorizations = Authorizations.fromUint8Array(authorizationsUint8Array);
        }

        return new ClusterBlock({header, payload, authorizations});
    }

    toString() {
        return uint8array.toHex(this.toUint8Array());
    }

    toHash(encoding = 'hex') {
        const headerHash = this.header.toHash();
        const payloadHash = this.payload.toHash();
        const combinedHash = sha256(uint8array.fromHex(headerHash + payloadHash));

        return (encoding === 'hex') ? uint8array.toHex(combinedHash) : combinedHash;
    }

    toJSON() {
        return {
            header: this.header.toJSON(),
            payload: this.payload.toJSON(),
            authorizations: this.authorizations.toJSON(),
        };
    }

    isFrozen() {
        // Placeholder for isFrozen logic
        return false;
    }

    isOpen() {
        // return true if block is between timestamp - 1m and timestamp -7 s
        return new Date().getTime() - this.header.timestamp < 60000 && !this.isFrozen() && !this.isVoting();
    }

    isVoting() {
        // return true if block is between timestamp - 5s and timestamp
        return new Date().getTime() - this.header.timestamp < 5000;
    }

    toDoc(signer){
        return makeDoc(this, signer);   
    }

    toSignableMessage({excludeAuthorizations = false} = {}) {
        return new SignableMessage(this.toHex({excludeAuthorizations}));
    }


    addAuthorization(authorization) {
        authorization = new Authorization(authorization);
        if(authorization.signature === '' || authorization.signature === undefined){
            console.error('ClusterBlock tried to add an empty authorization.');
            console.error(authorization);
            throw new Error('Signature is required for authorization.');
        }
        this.authorizations.addAuthorization(authorization);
    }

    async sign(signer) {
        this.authorizations.sign(this, signer);
        return this;
        // return signDoc(await this.toDoc(signer));
    }

    validate() {
        if (!this.authorizations) return {valid: false, error: 'Authorizations are required.'};

        const signedAuthorizations = this.authorizations.authorizations.filter(authorization => authorization.signature);
        if (!signedAuthorizations.length) return {valid: false, error: 'At least one authorization with signature is required.'};

        const authWithPublicKey = signedAuthorizations.filter(authorization => authorization.publicKey);
        if(authWithPublicKey.length < 0) return {valid: false, error: 'At least one authorization with public key is required.'};

        if (!this.authorizations.verify(this)) return {valid: false,error: 'Invalid signature.'};
        return {valid: true, error: ''};
    }

    isValid() {
        const logger = new Logger().context('ClusterBlock').method('isValid');
        logger.log('Checking if block is valid...');
        const {valid} = this.validate();
        return valid;
    }
}

export { ClusterBlock };
export default ClusterBlock;