import BattleshipGame from './battleship-game.js';
import GridSelectionStrategy from './grid-selection-strategy.js';
import Player from './player.js';

/**
 * @typedef ComputerPlayerInit
 * @type {object}
 * @property {GridSelectionStrategy} placementStrategy - the strategy to employ when placing ships.
 * @property {GridSelectionStrategy} attackStrategy - the strategy to employ when attacking.
 */

/** Class representing a computer controlled player. */
export default class ComputerPlayer extends Player {

    /**
     * Create a computer player with specified ship placement strategy and attack strategy.
     * @param  {ComputerPlayerInit} init - the initialization options for the computer player.
     */
    constructor({ placementStrategy = GridSelectionStrategy.RANDOM_PLACEMENT, attackStrategy = GridSelectionStrategy.RANDOM_ATTACK } = {}) {
        super();

        if (typeof placementStrategy !== 'function') {
            throw new TypeError(`Parameter 'placementStrategy' must be a function.`);
        }

        if (typeof attackStrategy !== 'function') {
            throw new TypeError(`Parameter 'attackStrategy' must be a function.`);
        }

        this._placementStrategy = placementStrategy;
        this._attackStrategy = attackStrategy;
        this.addEventListener('joined-game', ::this._onJoinedGame);
    }

    _onJoinedGame(e) {

        const game = e.game;
        const state = e.state;

        game.addEventListener('state-change', e => {

            // the game has entered the placement phase, place all of our ships
            // by calling into the placement strategy behavior
            if (game.state === BattleshipGame.STATE_PLACEMENT) {

                const placementStrategy = this._placementStrategy;

                placementStrategy(state);

                // now we've placed all our parts, mark our state as ready to proceed

                state.ready = true;

            }

        });

        // whenever the player turn changes and its our turn,
        // request an attack using our attack strategy behavior
        game.addEventListener('player-turn', e => {

            if (e.player.player !== this) return;

            const attackStrategy = this._attackStrategy;

            const playerStates = [...game.playerStates.values()];

            const opponentPlayerStates = playerStates.filter(otherPlayerState => otherPlayerState !== state);

            attackStrategy(state, opponentPlayerStates);

        });

    }

}
