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
    ForbiddenError: class ForbiddenError extends BasicError {
        constructor(message, extra) {
            super(message || 'Not Found', extra);
        }

        get status() {
            return 403;
        }
    },
    AlreadySentError: class AlreadySentError extends BasicError {
        constructor(message, extra) {
            super(message || 'Already sent', extra);
        }

        get status() {
            return 423;
        }
    },
    BadDataError: class BadDataError extends BasicError {
        constructor(message, extra) {
            super(message || 'Bad data', extra);
        }

        get status() {
            return 400;
        }
    }
};

module.exports = Errors;
