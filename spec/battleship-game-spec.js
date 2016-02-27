import BattleshipGame from '../src/battleship-game.js';

describe('BattleshipGame',  () => {

    it('should ensure two players are provided', () => {

        expect(() => new BattleshipGame()).toThrow();
        expect(() => new BattleshipGame({ })).toThrow();
        expect(() => new BattleshipGame({ players: null })).toThrow();

    })

    it('should default to creating a 10×10 grid', () => {

        const player1 = jasmine.createSpyObj('player', ['todo']);
        const player2 = jasmine.createSpyObj('player', ['todo']);
        const players = [player1, player2];

        const game = new BattleshipGame({ players });

        expect(game.rules.grid).toEqual([10, 10]);

    })

    it('should allow creation of arbitrary size grids', () => {

        const player1 = jasmine.createSpyObj('player', ['todo']);
        const player2 = jasmine.createSpyObj('player', ['todo']);
        const players = [player1, player2];

        const rules = { grid: [20, 30] };

        const game = new BattleshipGame({ players, rules });

        expect(game.rules.grid).toEqual([20, 30]);

    })

    it('should ensure grid dimensions are greater than 0', () => {

        const player1 = jasmine.createSpyObj('player', ['todo']);
        const player2 = jasmine.createSpyObj('player', ['todo']);
        const players = [player1, player2];

        expect(() => new BattleshipGame({ rules: { grid: [0, 10] } })).toThrow();
        expect(() => new BattleshipGame({ rules: { grid: [10, 0] } })).toThrow();

    })

})
