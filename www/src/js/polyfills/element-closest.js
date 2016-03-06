const elementPrototype = Element.prototype;

if (elementPrototype.closest == null) {

    Object.defineProperty(elementPrototype, 'closest', {
        value(selector) {

            let element = this;

            while (element) {

                if (element.matches(selector)) {
                    break;
                }

                element = element.parentElement;
            }

            return element;

        }
    });

}
