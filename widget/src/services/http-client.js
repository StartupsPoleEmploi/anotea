/* global fetch */
import EventEmitter from 'events';

class HTTPError extends Error {
    constructor(message, json) {
        super(message);
        this.json = json;
    }
}

const emitter = new EventEmitter();
const handleResponse = (path, response) => {
    let statusCode = response.status;
    if (statusCode >= 400 && statusCode < 600) {
        emitter.emit('http:error', response);
        throw new HTTPError(`Server returned ${statusCode} when requesting resource ${path}`, response.json());
    }
    return response.json();
};

export const _get = path => {
    let referrer = new URL((document.referrer || 'http://unknown')).origin;
    return fetch(path, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Anotea-Widget': referrer,
        }
    })
    .then(res => handleResponse(path, res));
};

