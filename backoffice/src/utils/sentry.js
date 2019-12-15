import * as Sentry from '@sentry/browser';

const isEnabled = !!process.env.REACT_APP_ANOTEA_SENTRY_DSN;

export const initialize = () => {

    if (!isEnabled) {
        return;
    }

    Sentry.init({
        dsn: process.env.REACT_APP_ANOTEA_SENTRY_DSN,
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
