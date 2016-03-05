import EventEmitter from './event-emitter.js';
import Matrix from './matrix.js';

function stateMatrixFromDimensions(width, height) {

    const data = new Array(height);

    for(let row = 0; row < height; row ++) {

        const rowStates = new Array(width);

        for(let column = 0; column < width; column ++) {
            rowStates[column] = undefined;
        }

        data[row] = rowStates;
    }

    return new Matrix(height, width, data);

}

/** Class representing a players state within a game of battleships. */
export default class PlayerState extends EventEmitter {

    constructor({ player, grid } = {}) {
        super();
        this.player = player;
        this.grid = grid;
        this.shotmap = stateMatrixFromDimensions(grid.width, grid.height);
        this._ready = false;
    }

    get ready() {
        return this._ready;
    }

    set ready(value) {
        this._ready = value;
        this.dispatchEvent({ type: 'state-change' });
    }

    fire(opponent, position) {

        if (opponent == null) {
            throw new TypeError(`Parameter 'opponent' must be provided.`);
        }

        if (Array.isArray(position) !== true || position.length !== 2) {
            throw new TypeError(`Parameter 'position' must be a tuple of two values.`);
        }

        this.dispatchEvent({ type: 'request-fire', opponent, position });

    }

}
