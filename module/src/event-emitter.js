/**
 * @typedef Event
 * @type {object}
 * @property {string} type - the type of event dispatched
 * @property {object} [target] - the object that dispatched the event
 */

/**
 * Function representing a callback from a dispatched event.
 * @callback EventEmitter~callback
 * @param {Event} event - the dispatched event
 */

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

    /**
     * Add a lister callback for the specified event type.
     * @param {string} type - the type of event to listen for
     * @param {EventEmitter~callback} listener - the event callback
     */
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

    /**
     * Remove a lister callback for the specified event type.
     * @param {string} type - the type of event to listen for
     * @param {EventEmitter~callback} listener - the event callback
     */
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

    /**
     * Dispatch an event of a specified type to all current listeners.
     * @param {Event} event - the event to dispatch
     */
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
