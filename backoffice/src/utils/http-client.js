/* global fetch */
import { getToken } from '../utils/token';
import EventEmitter from 'events';

const baseUrl = '/api';
const emitter = new EventEmitter();
const handleResponse = (path, response) => {
    let statusCode = response.status;
    if (statusCode >= 400 && statusCode < 600) {
        emitter.emit('http:error', response);
        throw new Error(`Server returned ${statusCode} when requesting resource ${path}`);
    }
    return response.json();
};

export const _get = path => {
    return fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        }
    })
    .then(res => handleResponse(path, res));
};

export const _post = (path, body) => {
    return fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
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
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
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
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        }
    })
    .then(res => handleResponse(path, res));
};

export const subscribeToHttpEvent = (eventName, callback) => emitter.on(eventName, callback);
