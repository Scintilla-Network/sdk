'use strict';

const ALPHABET: string = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

const ALPHABET_MAP: { [char: string]: number } = {};
for (let z = 0; z < ALPHABET.length; z++) {
    const x: string = ALPHABET.charAt(z);
    ALPHABET_MAP[x] = z;
}

function polymodStep(pre: number): number {
    const b: number = pre >> 25;
    return (
        ((pre & 0x1ffffff) << 5) ^
        (-((b >> 0) & 1) & 0x3b6a57b2) ^
        (-((b >> 1) & 1) & 0x26508e6d) ^
        (-((b >> 2) & 1) & 0x1ea119fa) ^
        (-((b >> 3) & 1) & 0x3d4233dd) ^
        (-((b >> 4) & 1) & 0x2a1462b3)
    );
}

function prefixChk(prefix: string): number | string {
    let chk: number = 1;
    for (let i = 0; i < prefix.length; ++i) {
        const c: number = prefix.charCodeAt(i);
        if (c < 33 || c > 126) return 'Invalid prefix (' + prefix + ')';

        chk = polymodStep(chk) ^ (c >> 5);
    }
    chk = polymodStep(chk);

    for (let i = 0; i < prefix.length; ++i) {
        const v: number = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ (v & 0x1f);
    }
    return chk;
}

function convert(data: number[], inBits: number, outBits: number, pad: boolean): number[] | string {
    let value: number = 0;
    let bits: number = 0;
    const maxV: number = (1 << outBits) - 1;

    const result: number[] = [];
    for (let i = 0; i < data.length; ++i) {
        value = (value << inBits) | data[i];
        bits += inBits;

        while (bits >= outBits) {
            bits -= outBits;
            result.push((value >> bits) & maxV);
        }
    }

    if (pad) {
        if (bits > 0) {
            result.push((value << (outBits - bits)) & maxV);
        }
    } else {
        if (bits >= inBits) return 'Excess padding';
        if ((value << (outBits - bits)) & maxV) return 'Non-zero padding';
    }

    return result;
}

function toWords(bytes: number[]): number[] | string {
    return convert(bytes, 8, 5, true);
}

function fromWordsUnsafe(words: number[]): number[] | undefined {
    const res: number[] | string = convert(words, 5, 8, false);
    if (Array.isArray(res)) return res;
    return undefined;
}

function fromWords(words: number[]): number[] {
    const res: number[] | string = convert(words, 5, 8, false);
    if (Array.isArray(res)) return res;

    throw new Error(res.toString());
}

function getLibraryFromEncoding(encoding: string) {
    let ENCODING_CONST: number;
    if (encoding === 'bech32') {
        ENCODING_CONST = 1;
    } else {
        ENCODING_CONST = 0x2bc830a3;
    }

    function encode(prefix: string, words: number[], LIMIT?: number): string {
        LIMIT = LIMIT || 90;
        if (prefix.length + 7 + words.length > LIMIT) throw new TypeError('Exceeds length limit');

        prefix = prefix.toLowerCase();

        let chk: number | string = prefixChk(prefix);
        if (typeof chk === 'string') throw new Error(chk);

        let result: string = prefix + '1';
        for (let i = 0; i < words.length; ++i) {
            const x: number = words[i];
            if (x >> 5 !== 0) throw new Error('Non 5-bit word');

            chk = polymodStep(chk as number) ^ x;
            result += ALPHABET.charAt(x);
        }

        for (let i = 0; i < 6; ++i) {
            chk = polymodStep(chk as number);
        }
        chk ^= ENCODING_CONST;

        for (let i = 0; i < 6; ++i) {
            const v: number = (chk >> ((5 - i) * 5)) & 0x1f;
            result += ALPHABET.charAt(v);
        }

        return result;
    }

    function __decode(str: string, LIMIT?: number): { prefix: string; words: number[] } | string {
        LIMIT = LIMIT || 90;
        if (str.length < 8) return str + ' too short';
        if (str.length > LIMIT) return 'Exceeds length limit';

        const lowered: string = str.toLowerCase();
        const uppered: string = str.toUpperCase();
        if (str !== lowered && str !== uppered) return 'Mixed-case string ' + str;
        str = lowered;

        const split: number = str.lastIndexOf('1');
        if (split === -1) return 'No separator character for ' + str;
        if (split === 0) return 'Missing prefix for ' + str;

        const prefix: string = str.slice(0, split);
        const wordChars: string = str.slice(split + 1);
        if (wordChars.length < 6) return 'Data too short';

        let chk: number | string = prefixChk(prefix);
        if (typeof chk === 'string') return chk;

        const words: number[] = [];
        for (let i = 0; i < wordChars.length; ++i) {
            const c: string = wordChars.charAt(i);
            const v: number | undefined = ALPHABET_MAP[c];
            if (v === undefined) return 'Unknown character ' + c;
            chk = polymodStep(chk as number) ^ v;

            if (i + 6 >= wordChars.length) continue;
            words.push(v);
        }

        if (chk !== ENCODING_CONST) return 'Invalid checksum for ' + str;
        return { prefix, words };
    }

    function decodeUnsafe(str: string, LIMIT?: number): { prefix: string; words: number[] } | undefined {
        const res: { prefix: string; words: number[] } | string = __decode(str, LIMIT);
        if (typeof res === 'object') return res;
        return undefined;
    }

    function decode(str: string, LIMIT?: number): { prefix: string; words: number[] } {
        const res: { prefix: string; words: number[] } | string = __decode(str, LIMIT);
        if (typeof res === 'object') return res;

        throw new Error(res.toString());
    }

    return {
        decodeUnsafe,
        decode,
        encode,
        toWords,
        fromWordsUnsafe,
        fromWords,
    };
}

const bech32 = getLibraryFromEncoding('bech32');
const bech32m = getLibraryFromEncoding('bech32m');

export { bech32, bech32m };
