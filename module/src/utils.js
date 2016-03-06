/**
 * A function that returns any value based on a given item and the items position within a parent sequence.
 * @callback toMap~selector
 * @param {*} item - the item to establish a value from
 * @param {number} index - the position of the item within the parent sequence
 * @return {*}
 */

/**
 * Reduce and map a given sequence of items to a map.
 * @param  {toMap~selector} keySelector - the selector that will be called to establish the key of a given item within the sequence
 * @param  {toMap~selector} valueSelector - the selector that will be called to establish the value of a given item within the sequence
 * @return {Map}
 */
export function toMap(keySelector, valueSelector) {

    const items = [...this];

    if (typeof keySelector !== 'function') {
        throw new TypeError(`Parameter 'keySelector' must be a function.`);
    }

    if (typeof valueSelector !== 'function') {
        throw new TypeError(`Parameter 'valueSelector' must be a function.`);
    }

    const map = new Map();

    const reduction = items.reduce((map, item, i) => {

        const key = keySelector(item, i);
        const value = valueSelector(item, i)

        map.set(key, value);

        return map;

    }, map);

    return reduction;

}

/**
 * Returns true if this value is between the specified minimum and maximum values; otherwise false.
 * @param  {number} min - the minimum value the item has to be
 * @param  {number} max - the maximum value the item has to be
 * @return {boolean}
 */
export function between(min, max) {

    const value = Number(this);

    return value >= min && value <= max;

}

/**
 * Normalize a value within a specified domain, such that values outside of
 * this domain are converted to their equivalent in-range value.
 * @param  {number} lower - the lower bound of the domain
 * @param  {number} upper - the upper bound of the domain
 * @return {number}
 */
export function normalizeWithinDomain(lower, upper) {

    let value = Number(this);

    const range = upper - lower;

    value %= range;

    if (value < lower) {
        value += range;
    }

    return value;

}

/**
 * Get an item within a sequence based on a reference item that exists within that
 * sequence and an offset from that item. If the established new item position is
 * outside of the sequence's domain then the position is normalized using {normalizeWithinDomain}.
 * @param  {*} item - the reference item within the sequence
 * @param  {number} offset - the offset from the reference item to find the relative item at
 * @return {*}
 */
export function getRelativeItem(item, offset) {

    const array = [...this];

    const existingIndex = array.indexOf(item);

    const newIndex = existingIndex + offset;

    const absoluteIndex = newIndex::normalizeWithinDomain(0, array.length);

    return array[absoluteIndex];

}

/**
 * Return a new array that is randomly shuffled from the source array using Fisher-Yates method.
 * @return {[*]}
 */
export function shuffled() {

    const array = this;
    const result = Array(length);
    const length = array.length;

    let index = -1;

    while (++index < length) {
        let rand = Math.floor(Math.random() * (index + 1));
        result[index] = result[rand];
        result[rand] = array[index];
    }

    return result;

}
