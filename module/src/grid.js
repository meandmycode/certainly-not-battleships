import Matrix from './matrix.js';

/** Class representing a players grid within a game of battleship. */
export default class Grid {

    /**
     * Create a grid of specific dimensions and ships.
     * @param  {[number, number]} dimensions - the dimensions of the grid
     * @param  {[Ship]} ships - the ships the player should place on the grid
     */
    constructor(dimensions, ships) {
        this.dimensions = dimensions;
        this.width = dimensions[0];
        this.height = dimensions[1];
        this.ships = ships;
    }

    /**
     * Find a ship within our grid that is intersecting with the specified position.
     * @param  {[number, number]} position - the position to find a ship at
     * @return {Ship}
     */
    getShipAtPosition(position) {

        // upcast our position coordinates to a matrix that can be intersected
        position = new Matrix([[1]]).placeAt(position);

        return this.ships.find(ship => ship.computed.intersects([position]));
    }

}
