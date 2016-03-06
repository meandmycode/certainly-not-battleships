import Matrix from '../src/matrix.js';

const ᵤ = undefined;

describe('Matrix', () => {

    it('should be able to create a matrix from a 2d array', () => {

        const matrix = new Matrix([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]);

    })

    it('should be able to place a matrix at a certain top, left position', () => {

        const input = new Matrix([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]);

        const expected = new Matrix([
            [ᵤ, ᵤ, ᵤ, ᵤ, ᵤ],
            [ᵤ, ᵤ, 1, 2, 3],
            [ᵤ, ᵤ, 4, 5, 6],
            [ᵤ, ᵤ, 7, 8, 9]
        ]);

        const actual = input.placeAt([2, 1]);

        expect(JSON.stringify(actual)).toEqual(JSON.stringify(expected));

    })

    it('should be able to rotate a matrix by 90 degrees', () => {

        const input = new Matrix([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]);

        const expected = new Matrix([
            [7, 4, 1],
            [8, 5, 2],
            [9, 6, 3]
        ]);

        const actual = input.turn(Matrix.ROTATION_90);

        expect(actual).toEqual(expected);

    })

    it('should be able to rotate a matrix by 180 degrees', () => {

        const input = new Matrix([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]);

        const expected = new Matrix([
            [9, 8, 7],
            [6, 5, 4],
            [3, 2, 1]
        ]);

        const actual = input.turn(Matrix.ROTATION_180);

        expect(actual).toEqual(expected);

    })

    it('should be able to rotate a matrix by 270 degrees', () => {

        const input = new Matrix([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]);

        const expected = new Matrix([
            [3, 6, 9],
            [2, 5, 8],
            [1, 4, 7]
        ]);

        const actual = input.turn(Matrix.ROTATION_270);

        expect(actual).toEqual(expected);

    })

});
