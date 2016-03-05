const arrayPrototype = Array.prototype;

if (arrayPrototype[Symbol.iterator] == null) {

    class ArrayIterator {

        constructor(array) {
            this.array = array;
            this.position = 0;
        }

        next() {

            const value = this.array[this.position];
            const done = this.position === this.array.length;

            if (done === false) {
                this.position++;
            }

            return { value, done };

        }

    }

    arrayPrototype[Symbol.iterator] = function() {
        return new ArrayIterator(this);
    };

}
