const arrayPrototype = Array.prototype;

if (arrayPrototype.fill == null) {

    // polyfill based on:
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/fill

    Object.defineProperty(arrayPrototype, 'fill', {
        value(value, start, end) {

            if (this == null) {
                throw new TypeError('this is null or not defined');
            }

            const O = Object(this);

            const len = O.length >>> 0;

            const relativeStart = start >> 0;

            const relativeEnd = end === undefined ? len : end >> 0;

            const final = relativeEnd < 0
                ? Math.max(len + relativeEnd, 0)
                : Math.min(relativeEnd, len);

            let k = relativeStart < 0
                ? Math.max(len + relativeStart, 0)
                : Math.min(relativeStart, len);

            while (k < final) {
                O[k] = value;
                k++;
            }

            return O;

        }
    });

}
