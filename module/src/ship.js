import Matrix from './matrix.js';

/**
 * Calculate the hittable points within a matrix by iterating
 * its values and counting those which are 1.
 * @param  {Matrix} matrix - the matrix to calculate
 * @return {number} the amount of values in the matrix whose value is 1
 */
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

    /**
     * Create a ship using the provided matrix to define the shape of the ship.
     * @param  {Matrix} matrix - the shape of the ship as a matrix.
     */
    constructor(matrix) {
        this._matrix = matrix;
        this._computed = null;
        this.health = calculateImpactArea(matrix);
    }

    /**
     * The ship's current matrix shape.
     * @property {Matrix} matrix
     */
    get matrix() {
        return this._matrix;
    }

    set matrix(value) {
        this._computed = null;
        this._matrix = value;
    }

    /**
     * The ship's current position.
     * @property {[number, number]} position
     */
    get position() {
        return this._position;
    }

    set position(value) {
        this._computed = null;
        this._position = value;
    }

    /**
     * The ship's current rotation in degrees, limited to 90 degree increments.
     * @property {number} rotation
     */
    get rotation() {
        return this._rotation;
    }

    set rotation(value) {
        this._computed = null;
        this._rotation = value;
    }

    /**
     * The ship's computed matrix after rotation and position are taken into consideration.
     * @property {Matrix} computed
     */
    get computed() {

        if (this.rotation == null) {
            throw new Error(`CANNOT_GET_COMPUTED_MATRIX_WITHOUT_ROTATION`);
        }

        if (this.position == null) {
            throw new Error(`CANNOT_GET_COMPUTED_MATRIX_WITHOUT_POSITION`);
        }

        if (this._computed == null) {
            this._computed = this.matrix.turn(this.rotation).placeAt(this.position);
        }

        return this._computed;
    }

}
