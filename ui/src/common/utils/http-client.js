import { getToken } from '../../backoffice/utils/session';
import EventEmitter from 'events';

class HTTPError extends Error {
    constructor(message, json, statusCode) {
        super(message);
        this.json = json;
        this.statusCode = statusCode;
    }
}

const emitter = new EventEmitter();
const handleResponse = (path, response) => {
    let statusCode = response.status;
    if (statusCode >= 400 && statusCode < 600) {
        emitter.emit('http:error', response);
        throw new HTTPError(`Server returned ${statusCode} when requesting resource ${path}`, response.json(), statusCode);
    }
    return response.json();
};


const getHeaders = () => {

    let isApplication = name => window.location.pathname.startsWith(`/${name}`);
    let getReferrerUrl = () => new URL((document.referrer || 'http://unknown'));

    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(isApplication('admin') ? { 'Authorization': `Bearer ${getToken()}` } : {}),
        ...(isApplication('widget') ? {
            'X-Anotea-Widget': getReferrerUrl().origin,
            'X-Anotea-Widget-Referrer': getReferrerUrl(),
        } : {})
    };
};

export const _get = path => {
    return fetch(`/api${path}`, {
        method: 'GET',
        headers: getHeaders()
    })
    .then(res => handleResponse(path, res));
};

export const _post = (path, body) => {
    return fetch(`/api${path}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
    })
    .then(res => handleResponse(path, res));
};

export const _put = (path, body = {}) => {
    return fetch(`/api${path}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body)
    })
    .then(res => handleResponse(path, res));
};

export const _delete = path => {
    return fetch(`/api${path}`, {
        method: 'DELETE',
        headers: getHeaders()
    })
    .then(res => handleResponse(path, res));
};

export const subscribeToHttpEvent = (eventName, callback) => emitter.on(eventName, callback);
