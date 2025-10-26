import { deserialize, serialize } from '@scintilla-network/serialize';
import { uint8array, json } from '@scintilla-network/keys/utils';
import { sha256 } from '@scintilla-network/hashes/classic';

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
                        {   type: 'transfer',
                            percent: 200n, // 0.000200 (200 microbasis points, 0.000200%)
                            max: 20n * 10n ** 6n // 20 basis points (20%)
                        }
                    ],
                    metadata = {}
                } = {}) {

        this.kind = 'ASSET';
        this.name = name ?? 'UNDEFINED';
        this.symbol = symbol ?? 'UNDEFINED';
        this.supply =  {
            max: BigInt(supply.max ?? 100_000_000n * 10n**9n),
            total: BigInt(supply.total ?? 0n),
            circulating: BigInt(supply.circulating ?? 0n),
        }
        this.decimals = BigInt(decimals ?? 9);
        this.consensus = consensus;
        this.distributions = distributions ?? [];
        this.permissions = permissions;
        this.fees = [
            {
                type: 'transfer',
                percent: BigInt(fees?.[0]?.percent ?? 200n),
                max: BigInt(fees?.[0]?.max ?? 20n * 10n ** 6n),
            }
        ];  
        this.metadata = metadata ?? {};
    }

    /**
     * Create Asset from JSON
     * @param {Object} json - The JSON object
     * @returns {Asset} The Asset instance
     */
    static fromJSON(json) {
        return new Asset({
            ...json,
        });
    }


    /**
     * Create Asset from Uint8Array
     * @param {Uint8Array} inputArray - The Uint8Array
     * @returns {Asset} The Asset instance
     */
    static fromUint8Array(inputArray) {
        const assetProps = {};
        let offset = 0;

        const {value: elementKind, length: elementKindLength} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += elementKindLength;
        if(elementKind !== NET_KINDS['ASSET']) {
            throw new Error(`Invalid element kind: ${elementKind}(${NET_KINDS_ARRAY[elementKind]}) - Expected: ${NET_KINDS['ASSET']}(ASSET)`);
        }
        assetProps.kind = NET_KINDS_ARRAY[elementKind];

        // Name
        const {value: nameLength, length: nameLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += nameLengthBytes;
        assetProps.name = uint8array.toString(inputArray.subarray(offset, offset + nameLength));
        offset += nameLength;



        // Symbol
        const {value: symbolLength, length: symbolLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += symbolLengthBytes;
        assetProps.symbol = uint8array.toString(inputArray.subarray(offset, offset + symbolLength));
        offset += symbolLength;

        // Supply
        const {value: supplyMax, length: supplyMaxBytes} = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += supplyMaxBytes;
        const {value: supplyTotal, length: supplyTotalBytes} = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += supplyTotalBytes;
        const {value: supplyCirculating, length: supplyCirculatingBytes} = deserialize.toVarBigInt(inputArray.subarray(offset));
        offset += supplyCirculatingBytes;
        assetProps.supply = {
            max: supplyMax,
            total: supplyTotal,
            circulating: supplyCirculating
        };


        // Decimals
        const {value: decimals, length: decimalsBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        assetProps.decimals = decimals;
        offset += decimalsBytes;

        // Consensus
        const {value: consensusLength, length: consensusLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += consensusLengthBytes;
        const consensusString = uint8array.toString(inputArray.subarray(offset, offset + consensusLength));
        assetProps.consensus = json.parse(consensusString);
        offset += consensusLength;

        // Distributions
        const {value: distributionsLength, length: distributionsLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += distributionsLengthBytes;
        const distributionsString = uint8array.toString(inputArray.subarray(offset, offset + distributionsLength));
        assetProps.distributions = json.parse(distributionsString);
        offset += distributionsLength;

        // Permissions
        const {value: permissionsLength, length: permissionsLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += permissionsLengthBytes;
        const permissionsString = uint8array.toString(inputArray.subarray(offset, offset + permissionsLength));
        assetProps.permissions = json.parse(permissionsString);
        offset += permissionsLength;

        // Fees
        const { value: feeAmount, length: feeAmountBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += feeAmountBytes;

        assetProps.fees = [];
        for (let i = 0; i < feeAmount; i++) {
            const {value: feeLength, length: feeLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
            offset += feeLengthBytes;
            const feeString = uint8array.toString(inputArray.subarray(offset, offset + feeLength));
            offset += feeLength;
            assetProps.fees.push(json.parse(feeString));
        }

        // Metadata
        const {value: metadataLength, length: metadataLengthBytes} = deserialize.toVarInt(inputArray.subarray(offset));
        offset += metadataLengthBytes;
        const metadataString = uint8array.toString(inputArray.subarray(offset, offset + metadataLength));
        assetProps.metadata = json.parse(metadataString);
        offset += metadataLength;

        return new Asset(assetProps);
    }

    /**
     * Create Asset from hex string
     * @param {string} hex - The hex string
     * @returns {Asset} The Asset instance
     */
    static fromHex(hex) {
        const uint8Array = uint8array.fromHex(hex);
        return Asset.fromUint8Array(uint8Array);
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

        const kind = NET_KINDS['ASSET'];
        const {value: elementKindUint8Array, length: elementKindUint8ArrayLength} = serialize.fromVarInt(kind);

        // Name
        const nameUint8Array = uint8array.fromString(this.name);
        const {value: nameLengthUint8Array, length: nameLengthUint8ArrayLength} = serialize.fromVarInt(nameUint8Array.length);

        // Symbol
        const symbolUint8Array = uint8array.fromString(this.symbol);
        const {value: symbolLengthUint8Array, length: symbolLengthUint8ArrayLength} = serialize.fromVarInt(symbolUint8Array.length);

        // Supply (max, total, circulating as BigInt)
        const {value: supplyMaxUint8Array, length: supplyMaxUint8ArrayLength} = serialize.fromVarBigInt(this.supply.max);
        const {value: supplyTotalUint8Array, length: supplyTotalUint8ArrayLength} = serialize.fromVarBigInt(this.supply.total);
        const {value: supplyCirculatingUint8Array, length: supplyCirculatingUint8ArrayLength} = serialize.fromVarBigInt(this.supply.circulating);

        // Decimals
        const {value: decimalsUint8Array, length: decimalsUint8ArrayLength} = serialize.fromVarInt(this.decimals);

        // Consensus (as JSON)
        const consensusString = json.sortedJsonByKeyStringify(this.consensus);
        const consensusUint8Array = uint8array.fromString(consensusString);
        const {value: consensusLengthUint8Array, length: consensusLengthUint8ArrayLength} = serialize.fromVarInt(consensusUint8Array.length);

        // Distributions (as JSON)
        const distributionsString = json.sortedJsonByKeyStringify(this.distributions);
        const distributionsUint8Array = uint8array.fromString(distributionsString);
        const {value: distributionsLengthUint8Array, length: distributionsLengthUint8ArrayLength} = serialize.fromVarInt(distributionsUint8Array.length);

        // Permissions (as JSON)
        const permissionsString = json.sortedJsonByKeyStringify(this.permissions);
        const permissionsUint8Array = uint8array.fromString(permissionsString);
        const {value: permissionsLengthUint8Array, length: permissionsLengthUint8ArrayLength} = serialize.fromVarInt(permissionsUint8Array.length);

        // Fees (as JSON)
        const {value: feesAmountUint8Array, length: feesAmountUint8ArrayLength} = serialize.fromVarInt(this.fees.length);
        const feesUint8Array = [];
        for(let i = 0; i < this.fees.length; i++) {
            const fee = this.fees[i];
            const feeString = json.stringify(fee);
            const {value: feeLengthUint8Array, length: feeLengthUint8ArrayLength} = serialize.fromVarInt(feeString.length);
            const feeUint8Array = uint8array.fromString(feeString);
            feesUint8Array.push(...feeLengthUint8Array, ...feeUint8Array);
        }

        // Metadata (as JSON)
        const metadataString = json.sortedJsonByKeyStringify(this.metadata);
        const metadataUint8Array = uint8array.fromString(metadataString);
        const {value: metadataLengthUint8Array, length: metadataLengthUint8ArrayLength} = serialize.fromVarInt(metadataUint8Array.length);

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


    /**
     * Convert to hex string
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

  
    /**
     * Returns the JSON representation of the Asset
     * @returns {Object} The JSON representation of the Asset
     */
    toJSON() {
        return {
            kind: this.kind,
            name: this.name,
            symbol: this.symbol,
            supply: {
                max: this.supply.max.toString(),
                total: this.supply.total.toString(),
                circulating: this.supply.circulating.toString()
            },
            decimals: this.decimals.toString(),
            consensus: this.consensus,
            distributions: this.distributions.map(distribution => ({
                ...distribution,
                weight: distribution?.weight.toString(),
                roles: {
                    ...distribution?.roles,
                    proposers: distribution?.roles?.proposers.toString(),
                    validators: distribution?.roles?.validators.toString(),
                    treasury: distribution?.roles?.treasury.toString()
                }
            })),
            permissions: this.permissions,
            fees: this.fees.map(fee => ({
                ...fee,
                percent: fee?.percent?.toString(),
                max: fee?.max.toString()
            })),
            metadata: this.metadata
        };
    }
}
export { Asset };

export default Asset;

