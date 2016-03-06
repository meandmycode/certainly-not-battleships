const elementPrototype = Element.prototype;

if (elementPrototype.matches == null) {

    const fn = elementPrototype.webkitMatchesSelector || elementPrototype.msMatchesSelector;

    Object.defineProperty(elementPrototype, 'matches', {
        value(selector) {
            return fn.call(this, selector);
        }
    });

}
