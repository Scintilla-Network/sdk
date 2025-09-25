/**
 * Class representing a BigDecimal for arbitrary-precision decimal arithmetic.
 */
class BigDecimal {
    /**
     * Create a BigDecimal.
     * @param {string|number|BigDecimal} value - The initial value.
     */
    constructor(value) {
        this.value = BigDecimal.parseValue(value);
    }

    /**
     * Parse the input value to a string.
     * @param {string|number|BigDecimal} value - The value to parse.
     * @returns {string} - The parsed value.
     * @throws Will throw an error if the value type is invalid.
     */
    static parseValue(value) {
        if (typeof value === 'string') {
            if (value.startsWith('.')) {
                return '0' + value;
            }
            return value;

        } else if (typeof value === 'number') {
            return value.toString();
        } else if (value instanceof BigDecimal) {
            return value.value;
        } else {
            throw new Error('Invalid value type');
        }
    }

    /**
     * Add another BigDecimal to this BigDecimal.
     * @param {BigDecimal} other - The other BigDecimal to add.
     * @returns {BigDecimal} - The sum of the two BigDecimals.
     */
    add(other) {
        let a = this.value.split('.');
        let b = BigDecimal.parseValue(other).split('.');

        let aInt = a[0];
        let bInt = b[0];
        let aDec = a[1] || '';
        let bDec = b[1] || '';

        while (aDec.length < bDec.length) aDec += '0';
        while (bDec.length < aDec.length) bDec += '0';

        let intSum = BigInt(aInt) + BigInt(bInt);
        let decSum = (BigInt(aDec) + BigInt(bDec)).toString().padStart(aDec.length, '0');

        if (decSum.length > aDec.length) {
            intSum += BigInt(decSum.slice(0, -aDec.length));
            decSum = decSum.slice(-aDec.length);
        }

        return new BigDecimal(intSum.toString() + '.' + decSum);
    }

    /**
     * Subtract another BigDecimal from this BigDecimal.
     * @param {BigDecimal} other - The other BigDecimal to subtract.
     * @returns {BigDecimal} - The difference of the two BigDecimals.
     */
    subtract(other) {
        let a = this.value.split('.');
        let b = BigDecimal.parseValue(other).split('.');

        let aInt = a[0];
        let bInt = b[0];
        let aDec = a[1] || '';
        let bDec = b[1] || '';

        while (aDec.length < bDec.length) aDec += '0';
        while (bDec.length < aDec.length) bDec += '0';

        let intDiff = BigInt(aInt) - BigInt(bInt);
        let decDiff = (BigInt(aDec) - BigInt(bDec)).toString().padStart(aDec.length, '0');

        if (decDiff.startsWith('-')) {
            intDiff -= BigInt(1);
            decDiff = (BigInt('1' + '0'.repeat(aDec.length)) + BigInt(decDiff)).toString().slice(1);
        }

        return new BigDecimal(intDiff.toString() + '.' + decDiff);
    }

    /**
     * Multiply this BigDecimal by another BigDecimal.
     * @param {BigDecimal} other - The other BigDecimal to multiply by.
     * @returns {BigDecimal} - The product of the two BigDecimals.
     */
    multiply(other) {
        let a = this.value.split('.');
        let b = BigDecimal.parseValue(other).split('.');

        let aInt = BigInt(a[0] + (a[1] || ''));
        let bInt = BigInt(b[0] + (b[1] || ''));
        let decPlaces = (a[1] || '').length + (b[1] || '').length;

        let result = (aInt * bInt).toString();

        return new BigDecimal(result.slice(0, -decPlaces) + '.' + result.slice(-decPlaces));
    }

    /**
     * Divide this BigDecimal by another BigDecimal.
     * @param {BigDecimal} other - The other BigDecimal to divide by.
     * @param {number} [precision=20] - The number of decimal places to maintain.
     * @returns {BigDecimal} - The quotient of the two BigDecimals.
     */
    divide(other, precision = 20) {
        let a = this.value.split('.');
        let b = BigDecimal.parseValue(other).split('.');

        let aInt = BigInt(a[0] + (a[1] || ''));
        let bInt = BigInt(b[0] + (b[1] || ''));
        let decPlacesA = (a[1] || '').length;
        let decPlacesB = (b[1] || '').length;
        let decPlaces = decPlacesA - decPlacesB;

        let quotient = (aInt * BigInt(10 ** (precision + Math.abs(decPlaces)))) / bInt;
        let quotientStr = quotient.toString();

        if (decPlaces < 0) {
            return new BigDecimal(
                quotientStr.slice(0, decPlaces) + '.' + quotientStr.slice(decPlaces)
            );
        } else {
            return new BigDecimal(
                quotientStr.slice(0, -precision) + '.' + quotientStr.slice(-precision)
            );
        }
    }
    /**
     * Compare this BigDecimal to another BigDecimal.
     * @param {BigDecimal} other - The other BigDecimal to compare to.
     * @returns {number} - Returns 0 if equal, -1 if this < other, 1 if this > other.
     */
    compareTo(other) {
        let a = this.value.split('.');
        let b = BigDecimal.parseValue(other).split('.');

        let aInt = BigInt(a[0] + (a[1] || ''));
        let bInt = BigInt(b[0] + (b[1] || ''));
        let aDecPlaces = (a[1] || '').length;
        let bDecPlaces = (b[1] || '').length;

        if (aInt === bInt && aDecPlaces === bDecPlaces) return 0;
        if (aInt > bInt || (aInt === bInt && aDecPlaces < bDecPlaces)) return 1;
        return -1;
    }

    /**
     * Check if this BigDecimal is equal to another BigDecimal.
     * @param {BigDecimal} other - The other BigDecimal to compare to.
     * @returns {boolean} - Returns true if equal, false otherwise.
     */
    equals(other) {
        return this.compareTo(other) === 0;
    }

    /**
     * Convert this BigDecimal to a number.
     * @returns {number} - The number representation of this BigDecimal.
     * @throws Will throw an error if the conversion loses precision.
     */
    toNumber() {
        let num = parseFloat(this.value);
        let scientificNotation = num.toExponential();
        let stringNotation = num.toString();

        if (this.value !== stringNotation && scientificNotation !== stringNotation){
            throw new Error(`Precision loss when converting to number ${this.value} !== ${stringNotation}`);
        }
        return num;
    }
    /**
     * Get the string representation of this BigDecimal.
     * @returns {string} - The string representation of this BigDecimal.
     */
    toString() {
        // Ensure there's a leading zero : 0.1 instead of .1
        // and ensure that 0.0 is represented as 0
        let str = this.value;
        if (str.startsWith('.')){
            str = `0${str}`;
        }

        return str;
    }

}

export default BigDecimal;
