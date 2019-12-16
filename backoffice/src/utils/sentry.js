import * as Sentry from '@sentry/browser';

let isEnabled;

export const initialize = dsn => {

    isEnabled = !!dsn;
    console.log(`Sentry enabled=${isEnabled}`);

    if (!isEnabled) {
        return;
    }

    Sentry.init({
        dsn,
        environment: process.env.REACT_APP_ANOTEA_ENV || 'dev'
    });
};

export const sendError = e => {
    if (!isEnabled) {
        console.error('[SENTRY] An error occurred', e);
    } else {
        return Sentry.captureException(e);
    }
};
