/**
 * Class representing a basic event emitter which just supports
 * typed events but not bubbling or cancelation.
 */
export default class EventEmitter {

    constructor() {
        this._listeners = new Map();
    }

    _getListenersForType(type) {
        return this._listeners[type] || (this._listeners[type] = new Set());
    }

    addEventListener(type, listener) {

        if (type == null) {
            throw new TypeError(`Parameter 'type' must be provided.`);
        }

        if (typeof listener !== 'function') {
            throw new TypeError(`Parameter 'listener' must be a function.`);
        }

        const listeners = this._getListenersForType(type);

        listeners.add(listener);

    }

    removeEventListener(type, listener) {

        if (type == null) {
            throw new TypeError(`Parameter 'type' must be provided.`);
        }

        if (typeof listener !== 'function') {
            throw new TypeError(`Parameter 'listener' must be a function.`);
        }

        const listeners = this._getListenersForType(type);

        listeners.delete(listener);

    }

    dispatchEvent(event) {

        if (event == null) {
            throw new TypeError(`Parameter 'event' must be provided.`);
        }

        if (event.type == null) {
            throw new TypeError(`Parameter 'event' must specify a 'type' property.`);
        }

        // ensure we record the sender of the event
        event.target = this;

        const listeners = this._getListenersForType(event.type);

        listeners.forEach(listener => listener(event));

    }

}
