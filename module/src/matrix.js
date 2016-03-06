import { normalizeWithinDomain } from './utils.js';

/** Class representing a 2-dimensional matrix. */
export default class Matrix {

    /**
     * Create a matrix of specific dimensions and data.
     * @param  {number} rows - the amount of rows within the matrix
     * @param  {number} columns - the amount of columns within the matrix
     * @param  {[]} data - the 2-dimensional data representing the matrix values
     */
    constructor(rows, columns, data) {

        if (Array.isArray(rows)) {
            data = rows;
            rows = data.length;
            columns = data[0].length;
        }

        this.rows = rows;
        this.columns = columns;
        this.data = data;
    }

    /**
     * Create a new matrix from the current matrix, with the specified vertical and horizontal offset.
     * @param  {[number, number]} position - the offset at which the source matrix will begin within the new matrix
     * @return {Matrix}
     */
    placeAt([column, row]) {

        const copy = this.clone();

        for (let row of copy.data) {
            row.splice(0, 0, ...new Array(column));
        }

        for (let i = 0; i < row; i++) {
            copy.data.splice(0, 0, new Array(this.columns + column))
        }

        copy.columns += column;
        copy.rows += row;

        return copy;

    }

    /**
     * Create a new matrix that is the transpose of the current matrix.
     * @return {Matrix}
     */
    transpose() {

        const data = new Array(this.columns);

        for (let i = 0; i < this.columns; i++) {

            data[i] = new Array(this.rows - 1);

            for (let j = this.rows - 1; j > -1; j--) {
                data[i][j] = this.data[j][i];
            }
        }

        return new Matrix(this.columns, this.rows, data);

    }

    /**
     * Create a new matrix that is a vertically flipped copy of the current matrix.
     * @return {Matrix}
     */
    vflip() {

        const copy = this.clone();
        copy.data.reverse();
        return copy;

    }

    /**
     * Create a new matrix that is a horizontally flipped copy of the current matrix.
     * @return {Matrix}
     */
    hflip() {

        const copy = this.clone();

        for (let row of copy.data) {
            row.reverse();
        }

        return copy;

    }

    /**
     * Create a new matrix that is a rotation of the current matrix by the specified rotation.
     * @param {number} rotation - the rotation in degrees, limited to 90 degree increments.
     * @return {Matrix}
     */
    turn(rotation) {

        rotation = rotation::normalizeWithinDomain(0, 360);

        // todo: normalize rotation to 0-360

        if (rotation === Matrix.ROTATION_0) {
            return this.clone();
        } else if (rotation === Matrix.ROTATION_90) {
            return this.vflip().transpose();
        } else if (rotation === Matrix.ROTATION_270) {
            return this.transpose().vflip();
        } else if (rotation === Matrix.ROTATION_180) {
            return this.hflip().vflip();
        } else {
            throw new Error(`Rotation must be 90 degree increments.`);
        }

    }

    /**
     * Get the value of the matrix at a given row and column position.
     * @param  {number} row - the row to find the value at
     * @param  {number} column - the column to find the value at
     * @return {*}
     */
    get(row, column) {
        return row >= this.rows ? undefined : this.data[row][column];
    }

    /**
     * Set the value of the matrix at a given row and column position.
     * @param {number} row - the row to find the value at
     * @param {number} column - the column to find the value at
     * @param {*} value - the value to set
     */
    set(row, column, value) {
        this.data[row][column] = value;
    }

    /**
     * Determine if the current matrix intersects any of the provided matrices
     * where intersection is considered to be when one or more matrix values are
     * equal to 1 at the same row and column position.
     * @param  {[Matrix]} matrices - the sequence of matrix to check intersection with
     * @return {boolean}
     */
    intersects(matrices) {

        // todo: potentially we can run faster here by merging the other matrices into one

        for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {

                const value = this.get(row, column);

                if (value === 1) {

                    for (let otherMatrix of matrices) {

                        const otherValue = otherMatrix.get(row, column);

                        if (otherValue === 1) {
                            return true;
                        }

                    }
                }
            }
        }

        return false;
    }

    /**
     * Create a shallow copy of the current matrix.
     * @return {Matrix}
     */
    clone() {

        const data = new Array(this.rows);

        for(let row = 0; row < this.rows; row ++) {
            data[row] = [...this.data[row]];
        }

        return new Matrix(this.rows, this.columns, data);
    }

    /**
     * Create a matrix of the specified width and height with all values initialized to 1.
     * @param  {number} width - the width of the filled matrix
     * @param  {number} height - the height of the filled matrix
     * @return {Matrix}
     */
    static rectangle(width, height) {

        const data = new Array(height);

        for(let row = 0; row < height; row ++) {
            data[row] = new Array(width).fill(1);
        }

        return new Matrix(height, width, data);

    }

    /**
     * Zero degrees of rotation.
     * @property {number}
     * @readonly
     */
    static get ROTATION_0() {
        return 0;
    }


    /**
     * 90 degrees of rotation.
     * @property {number}
     * @readonly
     */
    static get ROTATION_90() {
        return 90;
    }


    /**
     * 180 degrees of rotation.
     * @property {number}
     * @readonly
     */
    static get ROTATION_180() {
        return 180;
    }


    /**
     * 270 degrees of rotation.
     * @property {number}
     * @readonly
     */
    static get ROTATION_270() {
        return 270;
    }
}
