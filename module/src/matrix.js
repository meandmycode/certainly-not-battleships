function matrixFromDimensions(width, height) {

    const matrix = new Array(height);

    for(let row = 0; row < height; row ++) {
        matrix.push(new Array(width).fill(1));
    }

    return matrix;

}

function normalizeDegrees(degrees) {

    degrees %= 360;

    return degrees < 0 ? degrees + 360 : degrees;
}

export default class Matrix {

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

    vflip() {

        const copy = this.clone();
        copy.data.reverse();
        return copy;

    }

    hflip() {

        const copy = this.clone();

        for (let row of copy.data) {
            row.reverse();
        }

        return copy;

    }

    turn(rotation) {

        rotation = normalizeDegrees(rotation);

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

    get(row, column) {
        return row >= this.rows ? undefined : this.data[row][column];
    }

    set(row, column, value) {
        this.data[row][column] = value;
    }

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

    clone() {

        const data = new Array(this.rows);

        for(let row = 0; row < this.rows; row ++) {
            data[row] = [...this.data[row]];
        }

        return new Matrix(this.rows, this.columns, data);
    }

    static rectangle(width, height) {

        const data = new Array(height);

        for(let row = 0; row < height; row ++) {
            data[row] = new Array(width).fill(1);
        }

        return new Matrix(height, width, data);

    }

    static get ROTATION_0() {
        return 0;
    }

    static get ROTATION_90() {
        return 90;
    }

    static get ROTATION_180() {
        return 180;
    }

    static get ROTATION_270() {
        return 270;
    }
}
