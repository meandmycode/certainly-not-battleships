import GridSelectionStrategy from '../src/grid-selection-strategy.js';
import Grid from '../src/grid.js';
import PlayerState from '../src/player-state.js';
import Ship from '../src/ship.js';
import Matrix from '../src/matrix.js';

describe('GridSelectionStrategy',  () => {

    describe('RANDOM_PLACEMENT',  () => {

        it('should randomly place all ships at valid coordinates', () => {

            const player = {};

            const ship = new Ship(Matrix.rectangle(1, 1));

            const ships = [ship];

            const grid = new Grid([10, 20], ships);

            const playerState = new PlayerState({ player, grid });

            GridSelectionStrategy.RANDOM_PLACEMENT(playerState);

            expect(ship.position).toEqual([jasmine.any(Number), jasmine.any(Number)]);

        })

    })

    describe('RANDOM_ATTACK', () => {

        it('should attack at any random valid coordinate', () => {

            const playerState = jasmine.createSpyObj('PlayerState', ['fire'])

            const opponentPlayerState = {
                player: {},
                shotmap: new Map(),
                grid: {
                    dimensions: [10, 10],
                    width: 10,
                    height: 10
                }
            };

            GridSelectionStrategy.RANDOM_ATTACK(playerState, [opponentPlayerState]);

            expect(playerState.fire).toHaveBeenCalledWith(opponentPlayerState, [jasmine.any(Number), jasmine.any(Number)]);

        })

    })

});
