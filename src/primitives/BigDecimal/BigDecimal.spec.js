// import {describe, it, expect} from "vitest";
import { describe, it, expect } from '@scintilla-network/litest';
import BigDecimal from './BigDecimal.js';

describe('BigDecimal', () => {
    it('should handle decimals', () => {
        const num = new BigDecimal('0.1');
        expect(num.toString()).toBe('0.1');
        const num2 = new BigDecimal('0.00000000000000000000000000000000000000001');
        expect(num2.toString()).toBe('0.00000000000000000000000000000000000000001');
    });
    it('should add two big decimals correctly', () => {
        const num1 = new BigDecimal('123456789123456789.123456789');
        const num2 = new BigDecimal('987654321987654321.987654321');
        const sum = num1.add(num2);
        expect(sum.toString()).toBe('1111111111111111111.111111110');

        const num3 = new BigDecimal('0.1');
        const num4 = new BigDecimal('0.2');
        const sum2 = num3.add(num4);
        expect(sum2.toString()).toBe('0.3');
    });

    it('should subtract two big decimals correctly', () => {
        const num1 = new BigDecimal('987654321987654321.987654321');
        const num2 = new BigDecimal('123456789123456789.123456789');
        const difference = num1.subtract(num2);
        expect(difference.toString()).toBe('864197532864197532.864197532');
    });

    it('should multiply two big decimals correctly', () => {
        const num1 = new BigDecimal('123456789.123456789');
        const num2 = new BigDecimal('987654321.987654321');
        const product = num1.multiply(num2);
        expect(product.toString()).toBe('121932631356500531.347203169112635269');
    });

    it('should divide two big decimals correctly', () => {
        const num1 = new BigDecimal('987654321.987654321');
        const num2 = new BigDecimal('123456789.123456789');
        const quotient = num1.divide(num2, 22);
        expect(quotient.toString()).toBe('8.0000000729000006633900');

        const quotient30 = num1.divide(num2, 30);
        expect(quotient30.toString()).toBe('8.000000072900000822467006195686');

        const quotient50 = num1.divide(num2, 50);
        expect(quotient50.toString()).toBe('8.00000007290000127377159888630227997003983240638223');
    });

    it('should handle invalid value types', () => {
        expect(() => new BigDecimal({})).toThrow('Invalid value type');
    });
});
