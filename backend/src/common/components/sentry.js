const { init, captureException, configureScope } = require('@sentry/node');
const { getRemoteAddress } = require('../../http/routes/routes-utils');

module.exports = (logger, configuration) => {

    let isEnabled = configuration.sentry.enabled;

    if (isEnabled) {
        init({ dsn: configuration.sentry.dsn });
        process.on('unhandledRejection', e => captureException(e));
        process.on('uncaughtException', e => captureException(e));
    }

    return {
        sendError: (e, opts = {}) => {

            let req = opts.req;
            let options = req ? {
                requestId: req.requestId,
                user: {
                    ...(req.user ? { id: req.user.id } : {}),
                    ip_address: getRemoteAddress(req)
                }
            } : {};

            if (isEnabled) {
                if (options) {
                    configureScope(scope => {
                        scope.setExtra('requestId', options.requestId);
                        if (options.user) {
                            scope.setUser(options.user);
                        }
                    });
                }
                captureException(e);
            } else {
                logger.error(e, 'Message sent to Sentry', options);
            }
        },
    };
};
