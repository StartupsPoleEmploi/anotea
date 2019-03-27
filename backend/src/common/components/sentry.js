const { init, captureException, configureScope } = require('@sentry/node');

module.exports = (logger, configuration) => {

    let isEnabled = configuration.sentry.enabled;

    if (isEnabled) {
        init({ dsn: configuration.sentry.dsn });
        process.on('unhandledRejection', e => captureException(e));
        process.on('uncaughtException', e => captureException(e));
    }

    return {
        sendError: (e, options) => {
            if (isEnabled) {
                if (options) {
                    configureScope(scope => {
                        scope.setExtra('requestId', options.requestId);
                    });
                }
                captureException(e);
            } else {
                logger.error('Message sent to Sentry');
            }
        },
    };
};
