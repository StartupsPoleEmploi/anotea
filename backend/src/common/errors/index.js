'use strict';


class BasicError extends Error {
    constructor(message, extra) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message || 'Error';
        if (extra) {
            this.extra = extra;
        }
    }

    get status() {
        return 500;
    }
}

const Errors = {
    IdNotFoundError: class IdNotFoundError extends BasicError {
        constructor(message, extra) {
            super(message || 'Not Found', extra);
        }

        get status() {
            return 404;
        }
    },
};

module.exports = Errors;
