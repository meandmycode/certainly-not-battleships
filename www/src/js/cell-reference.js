import * as alphanumber from './alphanumber.js';

export function find(reference) {

    const match = reference.match(/\b([A-Za-z]+)([0-9]+)\b/);

    if (match == null) return null;

    const [, rowIdentifier, columnIdentifier] = match;

    return [parseInt(columnIdentifier, 10) - 1, alphanumber.parse(rowIdentifier) - 1];

}

export function stringify(reference) {
    return alphanumber.stringify(reference[1] + 1) + (reference[0] + 1);
}
