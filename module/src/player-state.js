import EventEmitter from './event-emitter.js';

/** Class representing a players state within a game of battleships. */
export default class PlayerState extends EventEmitter {

    constructor({ player, grid } = {}) {
        super();
        this.player = player;
        this.grid = grid;
        this._ready = false;
    }

    get ready() {
        return this._ready;
    }

    set ready(value) {
        this._ready = value;
        this.dispatchEvent({ type: 'state-change' });
    }

    fire(player, position) {

        if (player == null) {
            throw new TypeError(`Parameter 'player' must be provided.`);
        }

        if (Array.isArray(position) !== true || position.length !== 2) {
            throw new TypeError(`Parameter 'position' must be a tuple of two values.`);
        }

        this.dispatchEvent({ type: 'request-fire', player, position });

    }

}
