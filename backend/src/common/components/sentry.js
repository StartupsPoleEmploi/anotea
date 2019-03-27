const { init, captureException } = require('@sentry/node');

module.exports = (logger, configuration) => {

    let isEnabled = configuration.sentry.enabled;

    if (isEnabled) {
        init({ dsn: configuration.sentry.dsn });
        process.on('unhandledRejection', e => captureException(e));
        process.on('uncaughtException', e => captureException(e));
    }

    return {
        sendError: e => {
            if (isEnabled) {
                captureException(e);
            } else {
                logger.error('Message sent to Sentry');
            }
        },
    };
};
