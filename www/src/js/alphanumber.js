const CHAR_CODE_START = 65; // letter 'A'
const ALPHABET_SIZE = 26;

export function parse(str) {

    str = str.toUpperCase();

    const length = str.length;

    let result = 0;

    for (let i = 0, j = length - 1; i < length; i += 1, j -= 1) {
        result += Math.pow(ALPHABET_SIZE, j) * ((str.charCodeAt(i) - CHAR_CODE_START) + 1);
    }

    return result;

}

// reference: https://stackoverflow.com/questions/8240637/convert-numbers-to-letters-beyond-the-26-character-alphabet
export function stringify(number) {

    let result = '';

    while(number >= 0) {
        result = String.fromCharCode((number - 1) % ALPHABET_SIZE + CHAR_CODE_START) + result;
        number = Math.floor(number / ALPHABET_SIZE) - 1;
    }

    return result;

}
