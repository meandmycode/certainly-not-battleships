if (Object.assign == null) {

    // polyfill based on:
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

    Object.defineProperty(Object, 'assign', {
        value(target) {

            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            const output = Object(target);

            for (let index = 1; index < arguments.length; index++) {

                const source = arguments[index];

                if (source !== undefined && source !== null) {

                    for (let nextKey in source) {
                        if (source.hasOwnProperty(nextKey)) {
                            output[nextKey] = source[nextKey];
                        }
                    }
                }
            }

            return output;

        }
    });

}
