import { classic } from '@scintilla-network/hashes';
const { sha256 } = classic;
import { utils } from '@scintilla-network/keys';
import { varbigint } from '@scintilla-network/keys/utils';
const { uint8array, varint, json } = utils;
import { NET_KINDS, NET_KINDS_ARRAY } from '../messages/NetMessage/NET_KINDS.js';

/**
 * Asset class
 * @description The Asset class represents a digital or physical asset in a system, providing a structured way to define and interact with assets.
 */
class Asset {
    /**
     * Constructor for the Asset class
     * @param {Object} props - The properties of the asset
     * @param {string} props.name - The name of the asset
     * @param {string} props.symbol - The symbol of the asset
     * @param {Object} props.supply - The supply of the asset
     * @param {Object} props.consensus - The consensus of the asset
     * @param {number} props.decimals - The decimals of the asset
     * @param {Array} props.distributions - The distributions of the asset
     * @param {Object} props.permissions - The permissions of the asset
     * @param {Object} props.fees - The fees of the asset
     * @param {Object} props.metadata - The metadata of the asset
     */
    constructor({
                    name = 'UNDEFINED',
                    symbol = 'UNDEFINED',
                    supply = { },
                    consensus = {
                        members: [],
                        type: 'QUORUM_PROOF',
                        requirements: [],
                        distributions: [],
                    },
                    decimals = 9,
                    distributions = [],
                    permissions = {
                        mint: ['scintilla'],
                        burn: ['scintilla'],
                    },
                    fees = [
                        ['transfer', {
                            percent: 200n, // 0.000200 (200 microbasis points, 0.000200%)
                            max: 20n * 10n ** 6n // 20 basis points (20%)
                        }]
                    ],
                    metadata = {}
                } = {}) {

        this.name = name ?? 'UNDEFINED';
        this.symbol = symbol ?? 'UNDEFINED';
        this.supply =  { max: 100_000_000n * 10n**9n, total: 0n, circulating: 0n, ...supply };
        this.decimals = decimals ?? 9;
        this.consensus = consensus;
        this.distributions = distributions ?? [];
        this.permissions = permissions;
        this.fees = fees;
        this.metadata = metadata;
    }


    toUint8Array(options = {}) {
        if(options.excludeKindPrefix === undefined) {
            options.excludeKindPrefix = false;
        }

        const kind = NET_KINDS['ASSET'];
        const elementKindUint8Array = varint.encodeVarInt(kind, 'uint8array');

        // Name
        const nameUint8Array = uint8array.fromString(this.name);
        const nameLengthUint8Array = varint.encodeVarInt(nameUint8Array.length, 'uint8array');

        // Symbol
        const symbolUint8Array = uint8array.fromString(this.symbol);
        const symbolLengthUint8Array = varint.encodeVarInt(symbolUint8Array.length, 'uint8array');

        // Supply (max, total, circulating as BigInt)
        const supplyMaxUint8Array = varbigint.encodeVarBigInt(this.supply.max, 'uint8array');
        const supplyTotalUint8Array = varbigint.encodeVarBigInt(this.supply.total, 'uint8array');
        const supplyCirculatingUint8Array = varbigint.encodeVarBigInt(this.supply.circulating, 'uint8array');

        // Decimals
        const decimalsUint8Array = varint.encodeVarInt(this.decimals, 'uint8array');

        // Consensus (as JSON)
        const consensusString = json.sortedJsonByKeyStringify(this.consensus);
        const consensusUint8Array = uint8array.fromString(consensusString);
        const consensusLengthUint8Array = varint.encodeVarInt(consensusUint8Array.length, 'uint8array');

        // Distributions (as JSON)
        const distributionsString = json.sortedJsonByKeyStringify(this.distributions);
        const distributionsUint8Array = uint8array.fromString(distributionsString);
        const distributionsLengthUint8Array = varint.encodeVarInt(distributionsUint8Array.length, 'uint8array');

        // Permissions (as JSON)
        const permissionsString = json.sortedJsonByKeyStringify(this.permissions);
        const permissionsUint8Array = uint8array.fromString(permissionsString);
        const permissionsLengthUint8Array = varint.encodeVarInt(permissionsUint8Array.length, 'uint8array');

        // Fees (as JSON)
        const feesAmountUint8Array = varint.encodeVarInt(this.fees.length, 'uint8array');
        const feesUint8Array = [];
        for(let i = 0; i < this.fees.length; i++) {
            const fee = this.fees[i];
            const feeString = json.stringify(fee);
            const feeLengthUint8Array = varint.encodeVarInt(feeString.length, 'uint8array');
            const feeUint8Array = uint8array.fromString(feeString);
            feesUint8Array.push(...feeLengthUint8Array, ...feeUint8Array);
        }

        // Metadata (as JSON)
        const metadataString = json.sortedJsonByKeyStringify(this.metadata);
        const metadataUint8Array = uint8array.fromString(metadataString);
        const metadataLengthUint8Array = varint.encodeVarInt(metadataUint8Array.length, 'uint8array');

        const totalLength = (options.excludeKindPrefix ? 0 : elementKindUint8Array.length)
            + nameLengthUint8Array.length + nameUint8Array.length
            + symbolLengthUint8Array.length + symbolUint8Array.length
            + supplyMaxUint8Array.length + supplyTotalUint8Array.length + supplyCirculatingUint8Array.length
            + decimalsUint8Array.length
            + consensusLengthUint8Array.length + consensusUint8Array.length
            + distributionsLengthUint8Array.length + distributionsUint8Array.length
            + permissionsLengthUint8Array.length + permissionsUint8Array.length
            + feesAmountUint8Array.length + feesUint8Array.length
            + metadataLengthUint8Array.length + metadataUint8Array.length;

        const result = new Uint8Array(totalLength);
        let offset = 0;

        if(options.excludeKindPrefix === false) {
            result.set(elementKindUint8Array, offset); offset += elementKindUint8Array.length;
        }

        // Name
        result.set(nameLengthUint8Array, offset); offset += nameLengthUint8Array.length;
        result.set(nameUint8Array, offset); offset += nameUint8Array.length;

        // Symbol
        result.set(symbolLengthUint8Array, offset); offset += symbolLengthUint8Array.length;
        result.set(symbolUint8Array, offset); offset += symbolUint8Array.length;

        // Supply
        result.set(supplyMaxUint8Array, offset); offset += supplyMaxUint8Array.length;
        result.set(supplyTotalUint8Array, offset); offset += supplyTotalUint8Array.length;
        result.set(supplyCirculatingUint8Array, offset); offset += supplyCirculatingUint8Array.length;

        // Decimals
        result.set(decimalsUint8Array, offset); offset += decimalsUint8Array.length;

        // Consensus
        result.set(consensusLengthUint8Array, offset); offset += consensusLengthUint8Array.length;
        result.set(consensusUint8Array, offset); offset += consensusUint8Array.length;

        // Distributions
        result.set(distributionsLengthUint8Array, offset); offset += distributionsLengthUint8Array.length;
        result.set(distributionsUint8Array, offset); offset += distributionsUint8Array.length;

        // Permissions
        result.set(permissionsLengthUint8Array, offset); offset += permissionsLengthUint8Array.length;
        result.set(permissionsUint8Array, offset); offset += permissionsUint8Array.length;

        // Fees
        result.set(feesAmountUint8Array, offset); offset += feesAmountUint8Array.length;
        result.set(feesUint8Array, offset); offset += feesUint8Array.length;

        // Metadata
        result.set(metadataLengthUint8Array, offset); offset += metadataLengthUint8Array.length;
        result.set(metadataUint8Array, offset); offset += metadataUint8Array.length;

        return result;
    }


    static fromUint8Array(inputArray) {
        const assetProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['ASSET']) {
            throw new Error('Invalid element kind');
        }
        assetProps.kind = NET_KINDS_ARRAY[elementKind];

        // Name
        const {value: nameLength, length: nameLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += nameLengthBytes;
        assetProps.name = uint8array.toString(inputArray.subarray(offset, offset + nameLength));
        offset += nameLength;



        // Symbol
        const {value: symbolLength, length: symbolLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += symbolLengthBytes;
        assetProps.symbol = uint8array.toString(inputArray.subarray(offset, offset + symbolLength));
        offset += symbolLength;

        // Supply
        const {value: supplyMax, length: supplyMaxBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        offset += supplyMaxBytes;
        const {value: supplyTotal, length: supplyTotalBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        offset += supplyTotalBytes;
        const {value: supplyCirculating, length: supplyCirculatingBytes} = varbigint.decodeVarBigInt(inputArray.subarray(offset));
        offset += supplyCirculatingBytes;
        assetProps.supply = {
            max: supplyMax,
            total: supplyTotal,
            circulating: supplyCirculating
        };


        // Decimals
        const {value: decimals, length: decimalsBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        assetProps.decimals = decimals;
        offset += decimalsBytes;

        // Consensus
        const {value: consensusLength, length: consensusLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += consensusLengthBytes;
        const consensusString = uint8array.toString(inputArray.subarray(offset, offset + consensusLength));
        assetProps.consensus = json.parse(consensusString);
        offset += consensusLength;

        // Distributions
        const {value: distributionsLength, length: distributionsLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += distributionsLengthBytes;
        const distributionsString = uint8array.toString(inputArray.subarray(offset, offset + distributionsLength));
        assetProps.distributions = json.parse(distributionsString);
        offset += distributionsLength;

        // Permissions
        const {value: permissionsLength, length: permissionsLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += permissionsLengthBytes;
        const permissionsString = uint8array.toString(inputArray.subarray(offset, offset + permissionsLength));
        assetProps.permissions = json.parse(permissionsString);
        offset += permissionsLength;

        // Fees
        const { value: feeAmount, length: feeAmountBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += feeAmountBytes;

        assetProps.fees = [];
        for (let i = 0; i < feeAmount; i++) {
            const {value: feeLength, length: feeLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
            offset += feeLengthBytes;
            const feeString = uint8array.toString(inputArray.subarray(offset, offset + feeLength));
            offset += feeLength;
            assetProps.fees.push(json.parse(feeString));
        }

        // Metadata
        const {value: metadataLength, length: metadataLengthBytes} = varint.decodeVarInt(inputArray.subarray(offset));
        offset += metadataLengthBytes;
        const metadataString = uint8array.toString(inputArray.subarray(offset, offset + metadataLength));
        assetProps.metadata = json.parse(metadataString);
        offset += metadataLength;

        return new Asset(assetProps);
    }

    toHex() {
        return uint8array.toHex(this.toUint8Array());
    }

    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return Asset.fromUint8Array(uint8Array);
    }

    toHash(encoding = 'hex') {
        const uint8Array = this.toUint8Array();
        const hashUint8Array = sha256(uint8Array);
        return encoding === 'hex' ? uint8array.toHex(hashUint8Array) : hashUint8Array;
    }

    /**
     * Returns the JSON representation of the Asset
     * @returns {Object} The JSON representation of the Asset
     */
    toJSON() {
        return {
            name: this.name,
            symbol: this.symbol,
            supply: {
                max: this.supply.max.toString(),
                total: this.supply.total.toString(),
                circulating: this.supply.circulating.toString()
            },
            decimals: this.decimals,
            consensus: this.consensus,
            distributions: this.distributions,
            permissions: this.permissions,
            fees: this.fees,
            metadata: this.metadata
        };
    }
}
export { Asset };

export default Asset;

