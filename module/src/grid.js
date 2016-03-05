import Matrix from './matrix.js';

// todo: merge behaviour here into player-state
export default class Grid {

    constructor(dimensions, ships) {
        this.dimensions = dimensions;
        this.width = dimensions[0];
        this.height = dimensions[1];
        this.ships = ships;
    }

    // iterate our ships and see if any are hit by this attack
    getShipAtPosition(position) {

        // upcast our position coordinates to a matrix that can be intersected
        position = new Matrix([[1]]).placeAt(position);

        return this.ships.find(ship => ship.computed.intersects([position]));
    }

}
