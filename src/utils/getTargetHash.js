/**
 * Calculates a target hash based on the given difficulty.
 * @param {number|bigint|string} difficulty - The current mining difficulty.
 * @returns {string} The target hash as a hexadecimal string.
 */
export default function getTargetHash(difficulty) {
    const maxHash = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
    const difficultyBigInt = BigInt(difficulty);

    const target =
        difficultyBigInt === BigInt(0)
            ? maxHash
            : maxHash / difficultyBigInt;

    return target.toString(16).padStart(64, '0');
}
