/* global fetch */
import EventEmitter from 'events';

class HTTPError extends Error {
    constructor(message, json) {
        super(message);
        this.json = json;
    }
}

const baseUrl = 'https://anotea.pole-emploi.fr/api/v1';
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
    return fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(res => handleResponse(path, res));
};

export const _post = (path, body) => {
    return fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(res => handleResponse(path, res));
};

export const _put = (path, body = {}) => {
    return fetch(`${baseUrl}${path}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then(res => handleResponse(path, res));
};

export const _delete = path => {
    return fetch(`${baseUrl}${path}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(res => handleResponse(path, res));
};

export const subscribeToHttpEvent = (eventName, callback) => emitter.on(eventName, callback);
