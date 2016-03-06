import EventEmitter from './event-emitter.js';
import Matrix from './matrix.js';

/**
 * Create an empty matrix of the specified dimensions.
 * @param  {number} width - the column size of the matrix
 * @param  {number} height - the row size of the matrix
 * @return {Matrix}
 */
function stateMatrixFromDimensions(width, height) {

    const data = new Array(height);

    for(let row = 0; row < height; row ++) {
        data[row] = new Array(width);
    }

    return new Matrix(height, width, data);

}

/**
 * @typedef PlayerStateInit
 * @type {object}
 * @property {Player} player - the player whose state we're representing
 * @property {Grid} grid - the grid the player owns within the game
 */

/** Class representing a players state within a game of battleships. */
export default class PlayerState extends EventEmitter {

    /**
     * Create a gameplay state for the specified player and grid.
     * @param  {PlayerStateInit} init - the initialization options for the player state.
     */
    constructor({ player, grid } = {}) {
        super();
        this.player = player;
        this.grid = grid;
        this.shotmap = stateMatrixFromDimensions(grid.width, grid.height);
        this._ready = false;
    }

    /**
     * The players current ready state, used to indicate the player has placed
     * their ships and is ready to begin the attacking phase.
     * @property {boolean} ready
     */
    get ready() {
        return this._ready;
    }

    set ready(value) {
        this._ready = value;
        this.dispatchEvent({ type: 'state-change' });
    }

    /**
     * Request fire on a specified opponent and position.
     * @param  {PlayerState} opponent - the player to fire upon
     * @param  {[number, number]} position - the position at which to fire
     */
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
