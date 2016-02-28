import BattleshipGame from '../src/battleship-game.js';
import { Rectangle } from '../src/shape.js';
import Grid from '../src/grid.js';

describe('BattleshipGame',  () => {

    it('should ensure two players are provided', () => {

        expect(() => new BattleshipGame()).toThrow();
        expect(() => new BattleshipGame({ })).toThrow();
        expect(() => new BattleshipGame({ players: null })).toThrow();

    })

    it('should default to creating a 10×10 grid', () => {

        const player1 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const player2 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const players = [player1, player2];

        const game = new BattleshipGame({ players });

        expect(game.rules.grid).toEqual([10, 10]);

    })

    it('should allow creation of arbitrary size grids', () => {

        const player1 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const player2 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const players = [player1, player2];

        const rules = Object.assign(BattleshipGame.DEFAULT_RULES, {
            grid: [20, 30]
        });

        const game = new BattleshipGame({ players, rules });

        expect(game.rules.grid).toEqual([20, 30]);

    })

    it('should ensure grid dimensions are greater than 0', () => {

        const player1 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const player2 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const players = [player1, player2];

        expect(() => {

            const rules = Object.assign(BattleshipGame.DEFAULT_RULES, {
                grid: [0, 10]
            });

            new BattleshipGame({ players, rules });

        }).toThrow();

        expect(() => {

            const rules = Object.assign(BattleshipGame.DEFAULT_RULES, {
                grid: [10, 0]
            });

            new BattleshipGame({ players, rules });

        }).toThrow();

    })

    it('should allow a player to place ships', () => {

        const player1 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const player2 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const players = [player1, player2];

        const game = new BattleshipGame({ players });

        const state = game.getPlayerState(player1);

        const [shipA] = state.grid.ships;
        shipA.geometry.position = [0, 0];

    })

    it('should allow a player to mark placement phase as complete', () => {

        const player1 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const player2 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const players = [player1, player2];

        const rules = Object.assign(BattleshipGame.DEFAULT_RULES, {
            ships: [
                new Rectangle(1, 1)
            ]
        });

        const game = new BattleshipGame({ players, rules });

        const state = game.getPlayerState(player1);

        state.ready = true;

    })

    it('should allow a player to fire a shot', () => {

        const player1 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const player2 = jasmine.createSpyObj('player', ['dispatchEvent']);
        const players = [player1, player2];

        const rules = Object.assign(BattleshipGame.DEFAULT_RULES, {
            ships: [
                new Rectangle(1, 1)
            ]
        });

        const game = new BattleshipGame({ players, rules });

        const shotEventSpy = jasmine.createSpy();

        game.addEventListener('shot-fired', shotEventSpy);

        const state1 = game.getPlayerState(player1);
        const state2 = game.getPlayerState(player2);

        const [shipA] = state2.grid.ships;
        shipA.geometry.position = [0, 0];

        state1.fire(player2, [0, 0]);

        // assert we got a shot event as expected
        expect(shotEventSpy).toHaveBeenCalledWith({
            type: 'shot-fired',
            target: game,
            attacker: player1,
            defender: player2,
            shot: {
                hit: true,
                sank: true
            }
        });

    })

})
