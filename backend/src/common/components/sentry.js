const Raven = require('raven');

module.exports = (logger, configuration) => {

    let isEnabled = configuration.sentry.enabled;

    if (isEnabled) {
        Raven.config(configuration.sentry.DSN).install();
    }

    return {
        sendError: e => {
            if (isEnabled) {
                Raven.captureException(e);
            } else {
                logger.error('Message sent to Sentry');
            }
        },
    };
};
