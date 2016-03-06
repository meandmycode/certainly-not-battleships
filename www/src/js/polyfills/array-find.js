const arrayPrototype = Array.prototype;

if (arrayPrototype.find == null) {

    // polyfill based on:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find

    Object.defineProperty(arrayPrototype, 'find', {
        value(predicate) {

            if (this === null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }

            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            const list = Object(this);
            const length = list.length >>> 0;
            const thisArg = arguments[1];

            for (let i = 0; i < length; i++) {
                const value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }

            return undefined;

        }
    });

}
