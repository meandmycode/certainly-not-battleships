function createGridArray(width, height) {

    const columns = new Array(width);

    for (let column = 0; column < width; column++) {
        columns[column] = new Array(height);
    }

    return columns;

}

export default class Grid {

    constructor(dimensions, ships) {
        this.dimensions = dimensions;
        this.width = dimensions[0];
        this.height = dimensions[1];
        this._grid = createGridArray(this.width, this.height);
        this.ships = ships;
    }

    // iterate our ships and see if any are hit by this attack
    getShipAtPosition(position) {
        return this.ships.find(ship => ship.geometry.intersectsPoint(position));
    }

}
