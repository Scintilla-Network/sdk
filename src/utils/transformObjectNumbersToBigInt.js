/**
 * Recursively converts all number values in an object or array to BigInt
 * @param input - Object or array containing values to convert
 * @returns Copy of input with numbers converted to BigInt
 */
export default function transformObjectNumbersToBigInt(input) {
    // Handle null/undefined
    if (input == null) {
        return input;
    }

    // Handle arrays
    if (Array.isArray(input)) {
        return input.map(item => transformObjectNumbersToBigInt(item));
    }

    // Handle objects
    if (typeof input === 'object') {
        return Object.fromEntries(
            Object.entries(input).map(([key, value]) => [
                key,
                transformObjectNumbersToBigInt(value)
            ])
        );
    }

    // Convert numbers to BigInt, leave other types unchanged
    if (typeof input === 'number') {
        return BigInt(input);
    }

    return input;
}
