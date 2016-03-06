const mapPrototype = Map.prototype;

if (mapPrototype[Symbol.iterator] == null) {

    mapPrototype[Symbol.iterator] = function() {

        const pairs = new Array(this.size);
        let i = 0;

        this.forEach((value, key) => pairs[i++] = [key, value]);

        return pairs[Symbol.iterator]();

    };

}
