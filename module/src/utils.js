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
        const value = valueSelector(item)

        map.set(key, value);

        return map;

    }, map);

    return reduction;

}

export function between(min, max) {

    const value = this;

    return value >= min && value <= max;

}

export function randomInteger(min, max) {

    const range = max - min;

    const delta = Math.random() * range;

    return min + Math.floor(delta);

}

export function getRelativeItem(item, offset) {

    const array = this;

    const existingIndex = array.indexOf(item);

    const newIndex = existingIndex + offset;

    const absoluteIndex = 0 > newIndex
        ? -(-newIndex % array.length)
        : newIndex % array.length;

    return array[absoluteIndex];

}

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
