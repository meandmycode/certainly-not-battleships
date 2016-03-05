const mapPrototype = Map.prototype;

if (mapPrototype.values == null) {

    Object.defineProperty(mapPrototype, 'values', {
        value() {

            const values = new Array(this.size);
            let i = 0;

            this.forEach(value => values[i++] = value);

            return values;

        }
    });

}
