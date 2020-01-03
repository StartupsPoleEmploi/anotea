const _ = require('lodash');
const { init, captureException, configureScope } = require('@sentry/node');
const { getRemoteAddress } = require('../../http/utils/routes-utils');

module.exports = (logger, configuration) => {

    let isEnabled = !_.isEmpty(configuration.sentry.dsn);

    if (isEnabled) {
        init({ dsn: configuration.sentry.dsn, environment: configuration.env });
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
                logger.error(e, '[SENTRY] An error occurred', options);
            }
        },
    };
};
