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

        let result = intSum.toString();
        if (aDec.length > 0) {
            result += '.' + decSum;
        }

        return new BigDecimal(result);
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

        // Align decimal places
        let maxDecLen = Math.max(aDec.length, bDec.length);
        while (aDec.length < maxDecLen) aDec += '0';
        while (bDec.length < maxDecLen) bDec += '0';

        let intDiff = BigInt(aInt) - BigInt(bInt);
        let decDiff = BigInt(aDec) - BigInt(bDec);

        // Handle borrowing when decimal part is negative
        if (decDiff < 0n) {
            intDiff -= 1n;
            decDiff = BigInt('1' + '0'.repeat(maxDecLen)) + decDiff;
        }

        let decStr = decDiff.toString().padStart(maxDecLen, '0');
        let result = intDiff.toString();
        
        if (maxDecLen > 0) {
            result += '.' + decStr;
        }

        return new BigDecimal(result);
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

        // Special case: if result is "0", just return "0"
        if (result === '0') {
            return new BigDecimal('0');
        }

        // Handle the case where result is shorter than decimal places
        if (result.length <= decPlaces) {
            result = '0'.repeat(decPlaces - result.length + 1) + result;
        }

        if (decPlaces === 0) {
            return new BigDecimal(result);
        }

        let intPart = result.slice(0, -decPlaces) || '0';
        let decPart = result.slice(-decPlaces);

        // Remove trailing zeros from decimal part
        decPart = decPart.replace(/0+$/, '');
        
        // If no decimal part remains, return just the integer
        if (decPart === '') {
            return new BigDecimal(intPart);
        }

        return new BigDecimal(intPart + '.' + decPart);
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

        // Convert to integers by removing decimal points
        let aInt = BigInt(a[0] + (a[1] || ''));
        let bInt = BigInt(b[0] + (b[1] || ''));
        let decPlacesA = (a[1] || '').length;
        let decPlacesB = (b[1] || '').length;

        // Scale the numerator to account for the desired precision
        // We need to scale by: 10^(precision + decPlacesB - decPlacesA)
        let scaleExponent = precision + decPlacesB - decPlacesA;
        let scale = BigInt(10) ** BigInt(scaleExponent);
        let scaledNumerator = aInt * scale;

        // Perform the division
        let quotient = scaledNumerator / bInt;
        let remainder = scaledNumerator % bInt;
        
        // If there's no remainder, we have an exact division
        // Return the clean result without unnecessary decimal places
        if (remainder === 0n) {
            let quotientStr = quotient.toString();
            
            // We still need to place the decimal point correctly
            if (quotientStr.length <= precision) {
                quotientStr = '0'.repeat(precision - quotientStr.length + 1) + quotientStr;
            }
            
            let decimalPos = quotientStr.length - precision;
            let intPart = quotientStr.slice(0, decimalPos);
            let decPart = quotientStr.slice(decimalPos);
            
            // Remove trailing zeros from decimal part
            decPart = decPart.replace(/0+$/, '');
            
            // If no decimal part remains, return just the integer
            if (decPart === '') {
                return new BigDecimal(intPart);
            }
            
            return new BigDecimal(intPart + '.' + decPart);
        }
        
        // Non-exact division - keep the full precision
        let quotientStr = quotient.toString();

        // Now we need to insert the decimal point at the right position
        // The result has 'precision' decimal places
        if (quotientStr.length <= precision) {
            // Need to pad with leading zeros
            quotientStr = '0'.repeat(precision - quotientStr.length + 1) + quotientStr;
        }

        // Insert decimal point
        let decimalPos = quotientStr.length - precision;
        let intPart = quotientStr.slice(0, decimalPos);
        let decPart = quotientStr.slice(decimalPos);

        let result = intPart + '.' + decPart;

        return new BigDecimal(result);
    }

    /**
     * Compare this BigDecimal to another BigDecimal.
     * @param {BigDecimal} other - The other BigDecimal to compare to.
     * @returns {number} - Returns 0 if equal, -1 if this < other, 1 if this > other.
     */
    compareTo(other) {
        let a = this.value.split('.');
        let b = BigDecimal.parseValue(other).split('.');

        let aInt = BigInt(a[0]);
        let bInt = BigInt(b[0]);
        let aDec = a[1] || '';
        let bDec = b[1] || '';

        // Compare integer parts first
        if (aInt > bInt) return 1;
        if (aInt < bInt) return -1;

        // Integer parts are equal, compare decimal parts
        // Pad to same length
        let maxLen = Math.max(aDec.length, bDec.length);
        aDec = aDec.padEnd(maxLen, '0');
        bDec = bDec.padEnd(maxLen, '0');

        let aDecInt = BigInt(aDec || '0');
        let bDecInt = BigInt(bDec || '0');

        if (aDecInt > bDecInt) return 1;
        if (aDecInt < bDecInt) return -1;
        return 0;
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
        let str = this.value;
        
        // Ensure there's a leading zero: 0.1 instead of .1
        if (str.startsWith('.')) {
            str = '0' + str;
        }

        return str;
    }
}

export default BigDecimal;