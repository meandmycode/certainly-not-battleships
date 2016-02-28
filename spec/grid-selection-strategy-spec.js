import GridSelectionStrategy from '../src/grid-selection-strategy.js';
import Grid from '../src/grid.js';
import PlayerState from '../src/player-state.js';
import Ship from '../src/ship.js';
import { Rectangle } from '../src/shape.js';

describe('GridSelectionStrategy',  () => {

    describe('RANDOM_PLACEMENT',  () => {

        it('should randomly place all ships at valid coordinates', () => {

            const player = {};

            const ship = new Ship(new Rectangle(1, 1));

            const ships = [ship];

            const grid = new Grid([10, 20], ships);

            const playerState = new PlayerState({ player, grid });

            GridSelectionStrategy.RANDOM_PLACEMENT(playerState);

            expect(ship.geometry.position).toEqual([jasmine.any(Number), jasmine.any(Number)])

        })

    })

});
