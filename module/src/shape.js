import { between } from './utils.js';

/** Class representing an abstract 2-dimensional rectilinear polygon. */
export class Shape {

    constructor() {
        this._position = null;
        this._rotation = Shape.ROTATION_0;
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(value) {
        this._rotation = value;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        this._position = value;
    }

    get area() {
        throw new Error('NOT_IMPLEMENTED');
    }

    intersectsPoint(otherPosition) {
        throw new Error('NOT_IMPLEMENTED');
    }

    clone() {
        throw new Error('NOT_IMPLEMENTED');
    }

    static get ROTATION_0() {
        return 0;
    }

    static get ROTATION_90() {
        return 1;
    }

    static get ROTATION_180() {
        return 2;
    }

    static get ROTATION_270() {
        return 3;
    }
}

/** Class representing a basic 2d rectangle */
export class Rectangle extends Shape {

    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
    }

    intersectsPoint(otherPosition) {

        if (this.position == null) {
            return false;
        }

        // todo: !!! take rotation into consideration

        const [top, left] = this.position;
        const bottom = top + this.height;
        const right = left + this.width;

        const [x, y] = otherPosition;

        return x::between(left, right) && y::between(top, bottom);

    }

    get area() {
        return this.width * this.height;
    }

    clone() {
        const clone = new Rectangle(this.width, this.height);
        clone.position = this.position;
        clone.rotation = this.rotation;
        return clone;
    }

}
