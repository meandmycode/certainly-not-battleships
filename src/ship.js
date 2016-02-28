
/**
 * Class representing a ship in battleships, it contains 2d geometry used to
 * establish hit detection and health from the area of the geometry.
 */
export default class Ship {

    constructor(geometry) {
        this.geometry = geometry;
        this.health = geometry.area;
    }

}
