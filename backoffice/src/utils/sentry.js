import * as Sentry from '@sentry/browser';

const isEnabled = process.env.REACT_APP_ANOTEA_SENTRY_ENABLED === 'true';

export const init = () => {
    if (isEnabled) {
        Sentry.init({
            dsn: process.env.REACT_APP_ANOTEA_SENTRY_DSN,
            environment: process.env.REACT_APP_ANOTEA_ENV || 'dev'
        });
    }
};

export const sendError = e => {
    if (isEnabled) {
        return Sentry.captureException(e);
    } else {
        console.error('[SENTRY] An error occurred', e);
    }
};
