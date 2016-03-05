import Matrix from './matrix.js';
import { shuffled, randomInteger } from './utils.js';

/*
 * @typedef GridSelectionStrategy
 * @type {function}
 * @param {PlayerState} playerState - the player the strategy should be applied to.
 */

const rotations = [
    Matrix.ROTATION_0,
    Matrix.ROTATION_90,
    Matrix.ROTATION_180,
    Matrix.ROTATION_270,
];

const MAX_TRIES = 255;

function* getEveryPossiblePosition([width, height]) {

    for (let column = 0; column < width; column++) {
        for (let row = 0; row < height; row++) {

            const position = [column, row];

            yield position;

        }
    }
}

function* getEveryPossiblePlacement(dimensions) {

    for (let position of getEveryPossiblePosition(dimensions)) {

        for (let rotation of rotations) {
            yield [position, rotation];
        }
    }

}

function getRandomPlacement(ships, dimensions, currentTry = 0) {

    if (currentTry > MAX_TRIES) {
        throw new Error(`UNABLE_TO_SMART`);
    }

    const placements = new Map();
    const placementMatrices = [];

    const [columns, rows] = dimensions;

    for (let ship of ships) {

        let wasPlaced = false;

        const possiblePlacements = getEveryPossiblePlacement(dimensions)::shuffled();

        for (let [position, rotation] of possiblePlacements) {

            const matrix = ship.matrix
                .turn(rotation)
                .placeAt(position);

            // the ship was placed if it's geometry didn't intersect
            wasPlaced = rows >= matrix.rows && columns >= matrix.columns && matrix.intersects(placementMatrices) !== true;

            // if we managed to find a place for the geometry, then stop
            if (wasPlaced) {

                placements.set(ship, [position, rotation]);
                placementMatrices.push(matrix);

                break;

            }
        }

        // if we failed to place geometry in any of the possible positions on
        // the grid, then we need to retry placing all geometries again
        if (wasPlaced !== true) {
            return getRandomPlacement(ships, dimensions, currentTry + 1);
        }
    }

    return placements;

}

/** Class representing strategies for selecting points within a grid. */
export default class GridSelectionStrategy {

    /**
     * Creates a strategy that places ships at unique random points within the grid.
     * @type {GridSelectionStrategy}
     * @readonly
     */
    static get RANDOM_PLACEMENT() {

        // devnote: essentially here we're entering into bin packing world, realistically
        // though, our domain of packing is so sparse we'll never need to consider bin
        // packing and arguably, if we cannot sparsely (or non-uniformly) arrange our
        // ships then we're dealing with a grid that is soo dense that this becomes
        // a race to who will luck out the most and avoid any holes in the grid.
        //
        // as such, our implementation will take the following crude strategy:
        // sort our ships by area (size)
        // iterate each ship
        //   randomly iterate every unique available point in the grid where available means no other ship intersects this point
        //     iterate every rotation around that point
        //       validate the ship is contained within the grid
        //       validate the ship does not intersect any other placed ships
        //       place the ship and continue to the next ship
        //     on failing to place the ship in any rotation; contine to next available position
        //   on failing to place the ship at any available point; restart placement from scratch
        //   unless we reach n restarts, where n is arbitrarily large to ensure our algorithm is halting

        return playerState => {

            // devnote: we take a copy of the original ships since we're going to sort them
            const ships = [...playerState.grid.ships];

            // sort our ships by largest first
            // todo: this should be part of random placement
            // ships.sort((a, b) => a.geometry.area - b.geometry.area);

            const placements = getRandomPlacement(ships, playerState.grid.dimensions);

            // if we got this far then let's assign the placement positions of all our ships

            for (let [ship, [position, rotation]] of placements) {

                ship.position = position;
                ship.rotation = rotation;

            }

        };

    }

    /**
     * Creates a strategy that attacks unique random points within the grid.
     * @type {GridSelectionStrategy}
     * @readonly
     */
    static get RANDOM_ATTACK() {

        return (playerState, opponentPlayerStates) => {

            // select a random opponent
            const [opponentPlayerState] = opponentPlayerStates::shuffled();

            const positions = getEveryPossiblePosition(opponentPlayerState.grid.dimensions)::shuffled();

            for (let position of positions) {

                // once we find a position that hasn't been fired at, fire and stop
                if (opponentPlayerState.shotmap.get(...position) !== 1) {

                    playerState.fire(opponentPlayerState, position);

                    break;

                }

            }

        };

    }

    /**
     * Creates a strategy that at first selects unique random points within
     * the grid, but upon a successful hit will attempt to find a vector by
     * firstly attempting sibling points around the origin, then moving into
     * a vector march until a target is confirmed as destroyed.
     * @type {GridSelectionStrategy}
     * @readonly
     */
    static get RANDOM_ATTACK_INTO_VECTOR_MARCH() {

        return playerState => {
            throw new Error(`NOT_IMPLEMENTED`);
        };

    }

}
