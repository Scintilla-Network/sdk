import { Authorization } from '../Authorization/Authorization.js';
import { varint, uint8array } from '@scintilla-network/keys/utils';
import { sha256 } from '@scintilla-network/hashes/classic';

class Authorizations {
    constructor(authorizations = []) {
        if(authorizations?.authorizations){
            this.authorizations = authorizations.authorizations;
        } else {
            this.authorizations = authorizations;
        }
    }


    async sign(element, signer) {
        let authorization = new Authorization();
        authorization = await authorization.sign(element, signer);
        this.authorizations.push(authorization);
        return this;
    }

    verify(element) {
        let valid = true;
        let error = '';
        for(let i = 0; i < this.authorizations.length; i++) {
            const authorization = this.authorizations[i];
            const valid = authorization.verify(element);
            if(!valid.valid) {
                valid = false;
                error = valid.error;
                break;
            }
        }
        return {valid, error};
    }

    toUint8Array() {
        const authAmountBytes = varint.encodeVarInt(this.authorizations.length, 'uint8array');

        let authBytes = new Uint8Array(0);

        for(let i = 0; i < this.authorizations.length; i++) {
            const authorization = this.authorizations[i];
            const auth = authorization.toUint8Array();
            authBytes = new Uint8Array([...authBytes, ...auth]);
        }

        const authBytesLength = varint.encodeVarInt(authBytes.length, 'uint8array');
        const totalLength = authAmountBytes.length + authBytesLength.length + authBytes.length;
        const result = new Uint8Array(totalLength);
        let offset = 0;
        result.set(authAmountBytes, 0);offset += authAmountBytes.length;
        result.set(authBytesLength, offset);offset += authBytesLength.length;
        result.set(authBytes, offset);offset += authBytes.length;
        return result;
    }


    addAuthorization(authorization) {
        this.authorizations.push(authorization);
        return this;
    }


    find(predicate) {
        return this.authorizations.find(predicate);
    }

    static fromUint8Array(inputArray) {
        let offset = 0;
        const { value: authAmount, length: authAmountBytes } = varint.decodeVarInt(inputArray.subarray(offset));
        offset += authAmountBytes;

        const authorizations = new Authorizations();
        for(let i = 0; i < authAmount; i++) {
            const authLengthBytes = varint.decodeVarInt(inputArray.subarray(offset));
            const authLength = authLengthBytes.value;
            offset += authLengthBytes.length;

            const auth = inputArray.subarray(offset, offset + authLength);
            const authorization = Authorization.fromUint8Array(auth);

            authorizations.addAuthorization(authorization);
            offset += authLength;
        }
        return authorizations;
    }   

    toHash(format = 'hex') {
        const uint8Array = this.toUint8Array();
        const hash = sha256(uint8Array);
        return format === 'hex' ? uint8array.toHex(hash) : uint8array.toString(hash);
    }


}

export { Authorizations };
export default Authorizations;