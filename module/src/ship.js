import Matrix from './matrix.js';

function calculateImpactArea(matrix) {

    let count = 0;

    for (let row = 0; row < matrix.rows; row++) {
        for (let column = 0; column < matrix.columns; column++) {

            const value = matrix.data[row][column];

            if (value === 1) {
                count ++;
            }

        }
    }

    return count;

}

/**
 * Class representing a ship in battleships, it contains a matrix to
 * establish hit detection and health from the filled area of the matrix.
 */
export default class Ship {

    constructor(matrix) {
        this._matrix = matrix;
        this._computed = null;
        this.health = calculateImpactArea(matrix);
    }

    get matrix() {
        return this._matrix;
    }

    set matrix(value) {
        this._computed = null;
        this._matrix = value;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        this._computed = null;
        this._position = value;
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(value) {
        this._computed = null;
        this._rotation = value;
    }

    get computed() {

        // todo: if position or rotation haven't yet been set, then throw

        if (this._computed == null) {
            this._computed = this.matrix.placeAt(this.position).turn(this.rotation);
        }

        return this._computed;
    }

}
