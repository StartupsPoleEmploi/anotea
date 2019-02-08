const Raven = require('raven');

module.exports = (logger, configuration) => {

    let isEnabled = configuration.log.sentry.enabled;

    if (isEnabled) {
        Raven.config(configuration.log.sentry.DSN).install();
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
