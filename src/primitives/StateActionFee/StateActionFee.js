import { varint, uint8array } from '@scintilla-network/keys/utils';
import { serialize, deserialize } from '@scintilla-network/serialize';

/**
 * StateActionFee represents a fee payment for a state action
 * N.B: There is currently no fee in Scintilla, this is early work for future inclusion of fees for community clusters.
 * Feel free to chime in and participate in defining the fee structure, or bring PR to help us
 * 
 * Structure:
 * {
 *   asset: string,      // Asset identifier (e.g., 'SCT', 'sct')
 *   amount: bigint,     // Fee amount in smallest unit
 *   payer: string,      // Identity/moniker of the payer
 *   voucher?: string    // Optional: Hash of voucher used for payment
 * }
 */
export class StateActionFee {
    /**
     * Create a new StateActionFee
     * @param {Object} props - The properties
     * @param {string} props.asset - The asset
     * @param {bigint} props.amount - The amount
     * @param {string} props.payer - The payer
     * @param {string} props.voucher - The voucher
     */
    constructor(props = {}) {
        this.asset = props.asset || null;
        this.amount = props.amount ? BigInt(props.amount) : 0n;
        this.payer = props.payer || null;
        this.voucher = props.voucher || null;
    }

    /**
     * Create StateActionFee array from JSON fees array
     * @param {Object} json - The JSON object
     * @returns {StateActionFee[]} The StateActionFee array
     */
    static fromFeesJSON(json) {
        const fees = [];
        if (!json || !json.fees) {
            return fees;
        }
        json.fees.forEach(fee => {
            fees.push(new StateActionFee(fee));
        });
        return fees;
    }

    /**
     * Create StateActionFee array from Uint8Array
     * @param {Uint8Array} input - The Uint8Array
     * @returns {StateActionFee[]} The StateActionFee array
     */
    static fromFeesUint8Array(input) {
        const fees = [];
        let offset = 0;

        // Read number of fees
        const { value: feesAmount, length: feesAmountBytes } = varint.decodeVarInt(input.subarray(offset));
        if (feesAmount === 0) {
            return fees;
        }
        offset += feesAmountBytes;

        // Read total length of fees data
        const { value: feesLength, length: feesLengthBytes } = varint.decodeVarInt(input.subarray(offset));
        offset += feesLengthBytes;

        // Read each fee
        for (let i = 0; i < feesAmount; i++) {
            const fee = StateActionFee.fromUint8Array(input.subarray(offset));
            fees.push(fee);
            offset += fee.toUint8Array().length;
        }

        return fees;
    }

    /**
     * Convert fees array to JSON
     * @param {StateActionFee[]} fees - The fees
     * @returns {Object[]} The JSON object
     */
    static toFeesJSON(fees) {
        if (!fees || fees.length === 0) {
            return [];
        }
        return fees.map(fee => {
            if (fee instanceof StateActionFee) {
                return fee.toJSON();
            }
            return new StateActionFee(fee).toJSON();
        });
    }

    /**
     * Convert fees array to Uint8Array
     * @param {StateActionFee[]} fees - The fees
     * @returns {Uint8Array} The Uint8Array
     */
    static toFeesUint8Array(fees) {
        if (!fees || fees.length === 0) {
            return varint.encodeVarInt(0, 'uint8array');
        }

        // Encode number of fees
        const feesAmountBytes = varint.encodeVarInt(fees.length, 'uint8array');

        // Encode each fee
        const feesByteArrays = [];
        let totalFeesLength = 0;

        for (let i = 0; i < fees.length; i++) {
            let fee = fees[i];
            if (!(fee instanceof StateActionFee)) {
                fee = new StateActionFee(fee);
            }
            const feeBytes = fee.toUint8Array();
            feesByteArrays.push(feeBytes);
            totalFeesLength += feeBytes.length;
        }

        // Encode total length
        const feesLengthBytes = varint.encodeVarInt(totalFeesLength, 'uint8array');

        // Combine all bytes
        const totalLength = feesAmountBytes.length + feesLengthBytes.length + totalFeesLength;
        const result = new Uint8Array(totalLength);

        let offset = 0;
        result.set(feesAmountBytes, offset);
        offset += feesAmountBytes.length;
        result.set(feesLengthBytes, offset);
        offset += feesLengthBytes.length;

        for (const feeBytes of feesByteArrays) {
            result.set(feeBytes, offset);
            offset += feeBytes.length;
        }

        return result;
    }

    /**
     * Create StateActionFee from Uint8Array
     * @param {Uint8Array} input - The Uint8Array
     * @returns {StateActionFee} The StateActionFee instance
     */
    static fromUint8Array(input) {
        let offset = 0;
        const feeProps = {};

        // Asset (string)
        const { value: asset, length: assetLength } = deserialize.toString(input.subarray(offset));
        feeProps.asset = asset;
        offset += assetLength;

        // Amount (bigint)
        const { value: amount, length: amountLength } = deserialize.toVarBigInt(input.subarray(offset));
        feeProps.amount = amount;
        offset += amountLength;

        // Payer (string)
        const { value: payer, length: payerLength } = deserialize.toString(input.subarray(offset));
        feeProps.payer = payer;
        offset += payerLength;

        // Voucher (optional string)
        if (offset < input.length) {
            const { value: voucher, length: voucherLength } = deserialize.toString(input.subarray(offset));
            feeProps.voucher = voucher || null;
            offset += voucherLength;
        }

        return new StateActionFee(feeProps);
    }

    /**
     * Create StateActionFee from hex string
     * @param {string} hex - The hex string
     * @returns {StateActionFee} The StateActionFee instance
     */
    static fromHex(hex) {
        return StateActionFee.fromUint8Array(uint8array.fromHex(hex));
    }

    /**
     * Create StateActionFee from JSON
     * @param {Object} json - The JSON object
     * @returns {StateActionFee} The StateActionFee instance
     */
    static fromJSON(json) {
        return new StateActionFee(json);
    }

    /**
     * Convert to Uint8Array
     * @returns {Uint8Array} The Uint8Array
     */
    toUint8Array() {
        // Asset
        const { value: assetBytes, length: assetLength } = serialize.fromString(this.asset || '');
        
        // Amount
        const { value: amountBytes, length: amountLength } = serialize.fromVarBigInt(this.amount);
        
        // Payer
        const { value: payerBytes, length: payerLength } = serialize.fromString(this.payer || '');
        
        // Voucher (optional)
        let voucherBytes = new Uint8Array(0);
        let voucherLength = 0;
        if (this.voucher) {
            const voucherData = serialize.fromString(this.voucher);
            voucherBytes = voucherData.value;
            voucherLength = voucherData.length;
        } else {
            // Empty string for null voucher
            const voucherData = serialize.fromString('');
            voucherBytes = voucherData.value;
            voucherLength = voucherData.length;
        }

        const totalLength = assetLength + amountLength + payerLength + voucherLength;
        const result = new Uint8Array(totalLength);

        let offset = 0;
        result.set(assetBytes, offset);
        offset += assetLength;
        result.set(amountBytes, offset);
        offset += amountLength;
        result.set(payerBytes, offset);
        offset += payerLength;
        result.set(voucherBytes, offset);
        offset += voucherLength;

        return result;
    }

    /**
     * Convert to hex string
     * @returns {string} The hex string
     */
    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    /**
     * Convert to JSON
     * @returns {Object} The JSON object
     */
    toJSON() {
        const json = {
            asset: this.asset,
            amount: this.amount,
            payer: this.payer,
        };

        if (this.voucher) {
            json.voucher = this.voucher;
        }

        return json;
    }

    /**
     * Validate the fee structure
     * @returns {Object} The validation result
     */
    validate() {
        if (!this.asset) {
            return { valid: false, error: 'Asset is required.' };
        }

        if (this.amount <= 0n) {
            return { valid: false, error: 'Amount must be greater than 0.' };
        }

        if (!this.payer) {
            return { valid: false, error: 'Payer is required.' };
        }

        return { valid: true, error: '' };
    }

    /**
     * Check if fee is valid
     * @returns {boolean} True if the fee is valid, false otherwise
     */
    isValid() {
        const { valid } = this.validate();
        return valid;
    }
}

export default StateActionFee;