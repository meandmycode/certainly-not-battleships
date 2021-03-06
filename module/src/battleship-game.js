import EventEmitter from './event-emitter.js';
import PlayerState from './player-state.js';
import Grid from './grid.js';
import Ship from './ship.js';
import Matrix from './matrix.js';
import { toMap, getRelativeItem } from './utils.js';

/**
 * @typedef BattleshipRules
 * @type {object}
 * @property {array} grid - a tuple representing the grid size in columns and rows.
 */

/**
 * @typedef BattleshipGameInit
 * @type {object}
 * @property {array} players - an array of exactly two players.
 * @property {BattleshipRules} [rules] - the rules for the battleship game.
 */

/** Class representing a round of battleships. */
export default class BattleshipGame extends EventEmitter {

    /**
     * Create a battleship game with specified players and rules.
     * @param  {BattleshipGameInit} init - the initialization options for the game.
     */
    constructor({ players, rules = BattleshipGame.DEFAULT_RULES } = {}) {

        if (Array.isArray(players) !== true || players.length !== 2) {
            throw new TypeError(`The init object must specify an array of exactly two 'players'.`);
        }

        if (rules.grid.some(size => 0 >= size)) {
            throw new TypeError(`The rules grid dimensions must be greater than 0.`);
        }

        super();

        this.rules = rules;
        this.players = players;

        this._state = BattleshipGame.STATE_STARTING;

        // build a map of all player states, whist we do this, let's hookup listeners for the
        // player state's state changing so we can automatically change our game state.
        this.playerStates = players::toMap(player => player, player => {

            const ships = rules.ships.map(shape => new Ship(shape));

            const grid = new Grid(rules.grid, ships);

            const playerState = new PlayerState({ player, grid });

            playerState.addEventListener('state-change', ::this._onPlayerStateChange);
            playerState.addEventListener('request-fire', ::this._onPlayerFire);

            player.dispatchEvent({ type: 'joined-game', game: this, state: playerState });

            return playerState;

        });

    }

    /**
     * Moves the game into placement phase if currently in the starting phase.
     */
    start() {

        if (this.state !== BattleshipGame.STATE_STARTING) {
            throw new Error(`ATTEMPT_TO_START_ALREADY_STARTED_GAME`);
        }

        this.state = BattleshipGame.STATE_PLACEMENT;
    }

    /**
     * The game's current state.
     * @return {number} state
     */
    get state() {
        return this._state;
    }

    set state(value) {

        // todo: validate the state change is legit

        this._state = value;
        this.dispatchEvent({ type: 'state-change' });

        // if we're changing to the attack phase then we need to start the player turns loop
        if (value === BattleshipGame.STATE_ATTACK) {
            this._nextTurn();
        }

    }

    _nextTurn() {

        // here we establish a running order for each player, this will be based on the
        // order the players were provided to the game; any player state actions must
        // be validated to be acceptable only when they are the active player.

        const playerStates = [...this.playerStates.values()];

        const currentPlayerState = this._activePlayerState;

        // if we have a current player then get the next player (looping around); otherwise, the first player
        const nextPlayer = currentPlayerState != null
            ? playerStates::getRelativeItem(currentPlayerState, 1)
            : playerStates[0];

        this._activePlayerState = nextPlayer;

        this.dispatchEvent({ type: 'player-turn', player: nextPlayer });

    }

    _onPlayerStateChange() {

        // we only care about the player ready state changing during placement
        // state, if the player state changes after this it is meaningless.
        if (this.state !== BattleshipGame.STATE_PLACEMENT) {
            return;
        }

        const playerStates = [...this.playerStates.values()]

        // check if all players are marked as ready, if so, let battle commence
        if (playerStates.every(playerState => playerState.ready)) {
            this.state = BattleshipGame.STATE_ATTACK;
        }

    }

    _onPlayerFire(e) {

        if (this.state !== BattleshipGame.STATE_ATTACK) {
            throw new Error(`ATTEMPT_TO_ATTACK_DURING_NON_ATTACK_PHASE`);
        }

        // todo: validate the player state can fire, and the position is correct and not already fired at

        const playerState = e.target;
        const defenderState = e.opponent;
        const position = e.position;

        if (playerState !== this._activePlayerState) {
            throw new Error(`ATTEMPT_TO_ATTACK_OUTSIDE_OF_TURN`);
        }

        if (defenderState.shotmap.get(...position) === 1) {
            throw new Error(`Parameter 'position' must be a previously untargetted position.`);
        }

        // mark the grid position as attacked
        defenderState.shotmap.set(...position, 1);

        // todo: validate defender state exists

        const ship = defenderState.grid.getShipAtPosition(position);

        // the ship was sank if its health reaches zero
        const sank = ship ? (--ship.health) === 0 : false;

        // the player was defeated if all their ships reach zero health
        const defeated = sank && defenderState.grid.ships.every(ship => ship.health === 0);

        const attacker = playerState.player;
        const defender = defenderState.player;

        this.dispatchEvent({ type: 'shot-fired', attacker, defender, position, ship, sank });

        if (sank) {
            this.dispatchEvent({ type: 'ship-sank', attacker, defender, position, ship });
        }

        if (defeated) {
            this.dispatchEvent({ type: 'player-defeated', attacker, defender });

            // todo: here we assume that only one player can be defeated to end the game
            this.state = BattleshipGame.STATE_FINISH;

        } else {
            this._nextTurn();
        }

    }

    /**
     * The 'starting' state value for a battleship game.
     * @property {number}
     * @readonly
     */
    static get STATE_STARTING() {
        return 1;
    }

    /**
     * The 'placement' state value for a battleship game.
     * @property {number}
     * @readonly
     */
    static get STATE_PLACEMENT() {
        return 2;
    }

    /**
     * The 'attack' state value for a battleship game.
     * @property {number}
     * @readonly
     */
    static get STATE_ATTACK() {
        return 3;
    }

    /**
     * The 'finish' state value for a battleship game.
     * @property {number}
     * @readonly
     */
    static get STATE_FINISH() {
        return 4;
    }

    /**
     * The default rules for a battleship game.
     * @property {BattleshipRules}
     * @readonly
     */
    static get DEFAULT_RULES() {

        return {
            grid: [10, 10],
            ships: [
                Matrix.rectangle(1, 5), // Aircraft carrier
                Matrix.rectangle(1, 4), // Battleship a
                Matrix.rectangle(1, 4), // Battleship b
            ]
        };
    }

}
