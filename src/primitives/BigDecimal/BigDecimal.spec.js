import { describe, it, expect } from '@scintilla-network/litest';
import BigDecimal from './BigDecimal.js';

describe('BigDecimal', () => {
    describe('Constructor and Parsing', () => {
        it('should handle string decimals', () => {
            const num = new BigDecimal('0.1');
            expect(num.toString()).toBe('0.1');
        });

        it('should handle very small decimals', () => {
            const num = new BigDecimal('0.00000000000000000000000000000000000000001');
            expect(num.toString()).toBe('0.00000000000000000000000000000000000000001');
        });

        it('should handle decimals starting with dot', () => {
            const num = new BigDecimal('.5');
            expect(num.toString()).toBe('0.5');
        });

        it('should handle integers', () => {
            const num = new BigDecimal('123456789');
            expect(num.toString()).toBe('123456789');
        });

        it('should handle number types', () => {
            const num = new BigDecimal(42.5);
            expect(num.toString()).toBe('42.5');
        });

        it('should handle BigDecimal copy', () => {
            const num1 = new BigDecimal('123.456');
            const num2 = new BigDecimal(num1);
            expect(num2.toString()).toBe('123.456');
        });

        it('should throw on invalid types', () => {
            expect(() => new BigDecimal({})).toThrow('Invalid value type');
            expect(() => new BigDecimal(null)).toThrow('Invalid value type');
        });
    });

    describe('Addition', () => {
        it('should add large decimals', () => {
            const num1 = new BigDecimal('123456789123456789.123456789');
            const num2 = new BigDecimal('987654321987654321.987654321');
            const sum = num1.add(num2);
            expect(sum.toString()).toBe('1111111111111111111.111111110');
        });

        it('should add small decimals (0.1 + 0.2)', () => {
            const num1 = new BigDecimal('0.1');
            const num2 = new BigDecimal('0.2');
            const sum = num1.add(num2);
            expect(sum.toString()).toBe('0.3');
        });

        it('should add decimals with different precisions', () => {
            const num1 = new BigDecimal('1.5');
            const num2 = new BigDecimal('2.75');
            const sum = num1.add(num2);
            expect(sum.toString()).toBe('4.25');
        });

        it('should handle zero addition', () => {
            const num1 = new BigDecimal('123.456');
            const num2 = new BigDecimal('0');
            const sum = num1.add(num2);
            expect(sum.toString()).toBe('123.456');
        });

        it('should add integer to decimal', () => {
            const num1 = new BigDecimal('5');
            const num2 = new BigDecimal('0.5');
            const sum = num1.add(num2);
            expect(sum.toString()).toBe('5.5');
        });
    });

    describe('Subtraction', () => {
        it('should subtract large decimals', () => {
            const num1 = new BigDecimal('987654321987654321.987654321');
            const num2 = new BigDecimal('123456789123456789.123456789');
            const diff = num1.subtract(num2);
            expect(diff.toString()).toBe('864197532864197532.864197532');
        });

        it('should subtract small decimals', () => {
            const num1 = new BigDecimal('0.3');
            const num2 = new BigDecimal('0.1');
            const diff = num1.subtract(num2);
            expect(diff.toString()).toBe('0.2');
        });

        it('should handle zero subtraction', () => {
            const num1 = new BigDecimal('123.456');
            const num2 = new BigDecimal('0');
            const diff = num1.subtract(num2);
            expect(diff.toString()).toBe('123.456');
        });

        it('should handle negative results', () => {
            const num1 = new BigDecimal('5');
            const num2 = new BigDecimal('10');
            const diff = num1.subtract(num2);
            expect(diff.toString()).toBe('-5');
        });

        it('should subtract with borrowing', () => {
            const num1 = new BigDecimal('10.0');
            const num2 = new BigDecimal('0.1');
            const diff = num1.subtract(num2);
            expect(diff.toString()).toBe('9.9');
        });
    });

    describe('Multiplication', () => {
        it('should multiply large decimals', () => {
            const num1 = new BigDecimal('123456789.123456789');
            const num2 = new BigDecimal('987654321.987654321');
            const product = num1.multiply(num2);
            expect(product.toString()).toBe('121932631356500531.347203169112635269');
        });

        it('should multiply simple decimals', () => {
            const num1 = new BigDecimal('2.5');
            const num2 = new BigDecimal('4');
            const product = num1.multiply(num2);
            expect(product.toString()).toBe('10');
        });

        it('should multiply by zero', () => {
            const num1 = new BigDecimal('123.456');
            const num2 = new BigDecimal('0');
            const product = num1.multiply(num2);
            expect(product.toString()).toBe('0');
        });

        it('should multiply decimals with different precisions', () => {
            const num1 = new BigDecimal('1.5');
            const num2 = new BigDecimal('2.25');
            const product = num1.multiply(num2);
            expect(product.toString()).toBe('3.375');
        });

        it('should multiply very small decimals', () => {
            const num1 = new BigDecimal('0.1');
            const num2 = new BigDecimal('0.1');
            const product = num1.multiply(num2);
            expect(product.toString()).toBe('0.01');
        });
    });

    describe('Division', () => {
        it('should divide with default precision', () => {
            const num1 = new BigDecimal('10');
            const num2 = new BigDecimal('3');
            const quotient = num1.divide(num2);
            expect(quotient.toString()).toBe('3.33333333333333333333');
            const quotient2 = num1.divide(num2, 20);
            expect(quotient2.toString()).toBe('3.33333333333333333333');
            const quotient3 = num1.divide(num2, 30);
            expect(quotient3.toString()).toBe('3.333333333333333333333333333333');
            const quotient4 = num1.divide(num2, 40);
            expect(quotient4.toString()).toBe('3.3333333333333333333333333333333333333333');
            const quotient5 = num1.divide(num2, 50);
            expect(quotient5.toString()).toBe('3.33333333333333333333333333333333333333333333333333');
            const quotient6 = num1.divide(num2, 5);
            expect(quotient6.toString()).toBe('3.33333');
        });

        it('should divide exact values', () => {
            const num1 = new BigDecimal('10');
            const num2 = new BigDecimal('2');
            const quotient = num1.divide(num2, 10);
            expect(quotient.toString()).toBe('5');
        });

        it('should divide 1/2', () => {
            const num1 = new BigDecimal('1');
            const num2 = new BigDecimal('2');
            const quotient = num1.divide(num2, 10);
            expect(quotient.toString()).toBe('0.5');
        });

        it('should divide 1/4', () => {
            const num1 = new BigDecimal('1');
            const num2 = new BigDecimal('4');
            const quotient = num1.divide(num2, 10);
            expect(quotient.toString()).toBe('0.25');
        });

        it('should divide with specified precision (original failing test)', () => {
            const num1 = new BigDecimal('987654321.987654321');
            const num2 = new BigDecimal('123456789.123456789');
            
            const quotient22 = num1.divide(num2, 22);
            expect(quotient22.toString()).toBe('8.0000000729000006633900');

            const quotient30 = num1.divide(num2, 30);
            expect(quotient30.toString()).toBe('8.000000072900000663390006036849');
            
            const quotient50 = num1.divide(num2, 50);
            expect(quotient50.toString()).toBe('8.00000007290000066339000603684905493532639991147023');
        });

        it('should divide with many decimal places', () => {
            const num1 = new BigDecimal('1234567890.1234567890');
            const num2 = new BigDecimal('987654321.987654321');
            const quotient = num1.divide(num2, 50);
            expect(quotient.toString()).toBe('1.24999998748437501151894530099351319510008107369874');
        });

        it('should divide small by large', () => {
            const num1 = new BigDecimal('1');
            const num2 = new BigDecimal('1000');
            const quotient = num1.divide(num2, 10);
            expect(quotient.toString()).toBe('0.001');
        });

        it('should divide decimals by decimals', () => {
            const num1 = new BigDecimal('0.5');
            const num2 = new BigDecimal('0.25');
            const quotient = num1.divide(num2, 10);
            expect(quotient.toString()).toBe('2');
        });

        it('should divide with precision 5', () => {
            const num1 = new BigDecimal('22');
            const num2 = new BigDecimal('7');
            const quotient = num1.divide(num2, 5);
            expect(quotient.toString()).toBe('3.14285');
        });

        it('should handle division resulting in leading zeros', () => {
            const num1 = new BigDecimal('1');
            const num2 = new BigDecimal('10');
            const quotient = num1.divide(num2, 5);
            expect(quotient.toString()).toBe('0.1');
        });
    });

    describe('Comparison', () => {
        it('should compare equal values', () => {
            const num1 = new BigDecimal('123.456');
            const num2 = new BigDecimal('123.456');
            expect(num1.compareTo(num2)).toBe(0);
            expect(num1.equals(num2)).toBe(true);
        });

        it('should compare greater values', () => {
            const num1 = new BigDecimal('200');
            const num2 = new BigDecimal('100');
            expect(num1.compareTo(num2)).toBe(1);
        });

        it('should compare lesser values', () => {
            const num1 = new BigDecimal('100');
            const num2 = new BigDecimal('200');
            expect(num1.compareTo(num2)).toBe(-1);
        });

        it('should compare decimals', () => {
            const num1 = new BigDecimal('0.1');
            const num2 = new BigDecimal('0.2');
            expect(num1.compareTo(num2)).toBe(-1);
        });
    });

    describe('Round-trip Operations', () => {
        it('should handle add then subtract', () => {
            const original = new BigDecimal('123.456');
            const toAdd = new BigDecimal('100');
            const result = original.add(toAdd).subtract(toAdd);
            expect(result.toString()).toBe(original.toString());
            expect(result.toString()).toBe('123.456');
        });

        it('should handle multiply then divide', () => {
            const original = new BigDecimal('123.456');
            const factor = new BigDecimal('10');
            const result = original.multiply(factor).divide(factor, 3);
            expect(result.toString()).toBe(original.toString());
            expect(result.toString()).toBe('123.456');
        });

        it('should handle complex chain', () => {
            const num = new BigDecimal('100');
            const result = num
                .add(new BigDecimal('50'))
                .subtract(new BigDecimal('25'))
                .multiply(new BigDecimal('2'))
                .divide(new BigDecimal('5'), 10);
            expect(result.toString()).toBe('50');
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero operations', () => {
            const zero = new BigDecimal('0');
            const num = new BigDecimal('123.456');
            
            expect(zero.add(num).toString()).toBe(num.toString());
            expect(num.add(zero).toString()).toBe(num.toString());
            expect(num.subtract(zero).toString()).toBe(num.toString());
            expect(zero.multiply(num).toString()).toBe('0');
        });

        it('should handle very large numbers', () => {
            const large = new BigDecimal('999999999999999999999999999999.123456789');
            const small = new BigDecimal('0.000000000000000000000000000001');
            const sum = large.add(small);
            expect(sum.toString()).toBe('999999999999999999999999999999.123456789000000000000000000001');
        });

        it('should handle precision edge cases', () => {
            const num1 = new BigDecimal('0.333333333333333333333333333333');
            const num2 = new BigDecimal('3');
            const product = num1.multiply(num2);
            expect(product.toString()).toBe('0.999999999999999999999999999999');
        });
    });

    describe('toNumber()', () => {
        it('should convert simple decimals to number', () => {
            const num = new BigDecimal('123.456');
            expect(num.toNumber()).toBe(123.456);
        });

        it('should handle zero', () => {
            const num = new BigDecimal('0');
            expect(num.toNumber()).toBe(0);
        });

        it('should handle negative numbers', () => {
            const num = new BigDecimal('-42.5');
            expect(num.toNumber()).toBe(-42.5);
        });
    });
});