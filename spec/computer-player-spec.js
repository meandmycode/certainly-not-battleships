import BattleshipGame from '../src/battleship-game.js';
import ComputerPlayer from '../src/computer-player.js';

describe('ComputerPlayer',  () => {

    it('should allow creation with a default set of strategies', () => {

        const computer = new ComputerPlayer();

    })

    it('should allow creation with specific strategies', () => {

        const placementStrategy = jasmine.createSpy();
        const attackStrategy = jasmine.createSpy();

        const computer = new ComputerPlayer({ placementStrategy, attackStrategy });

    })

    it('should react to joining a game by attaching to game events', () => {

        const placementStrategy = jasmine.createSpy();
        const attackStrategy = jasmine.createSpy();

        const computer = new ComputerPlayer({ placementStrategy, attackStrategy });

        const gameSpy = jasmine.createSpyObj('game', ['addEventListener']);

        computer.dispatchEvent({ type: 'joined-game', game: gameSpy });

        expect(gameSpy.addEventListener).toHaveBeenCalledWith('state-change', jasmine.any(Function));

    })

    it('should attempt to position ships according to placement strategy when informed the game state has changed', () => {

        const placementStrategy = jasmine.createSpy();
        const attackStrategy = jasmine.createSpy();

        const computer = new ComputerPlayer({ placementStrategy, attackStrategy });

        const game = {
            state: BattleshipGame.STATE_STARTING,
            addEventListener(type, listener) {

                if (type === 'state-change') {
                    game.state = BattleshipGame.STATE_PLACEMENT;
                    listener({ type: 'state-change' });
                }

            }
        };

        const state = {};

        computer.dispatchEvent({ type: 'joined-game', game, state });

        expect(placementStrategy).toHaveBeenCalledWith(state);

    })

    it('should attempt to attack according to attack strategy when given a turn', () => {

        const placementStrategy = jasmine.createSpy();
        const attackStrategy = jasmine.createSpy();

        const computer = new ComputerPlayer({ placementStrategy, attackStrategy });

        const game = {
            state: BattleshipGame.STATE_STARTING,
            addEventListener(type, listener) {

                if (type === 'player-turn') {
                    listener({ type: 'player-turn', player: computer });
                }

            }
        };

        const state = {};

        computer.dispatchEvent({ type: 'joined-game', game, state });

        expect(attackStrategy).toHaveBeenCalledWith(state);

    })

})
