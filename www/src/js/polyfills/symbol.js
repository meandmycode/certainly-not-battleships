if (this.Symbol == null) {

    let index = 0;

    this.Symbol = class Symbol {

        constructor() {
            this._key = `__GLOBAL_SYMBOL_${index++}`;
        }

        toString() {
            return this._key;
        }

        static get iterator() {
            return iteratorSymbol;
        }
    }

    const iteratorSymbol = new Symbol();

}
