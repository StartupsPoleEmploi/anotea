const Sentry = require('winston-raven-sentry');
const winston = require('winston');
const logrotate = require('winston-logrotate');

module.exports = (loggerName, configuration) => {

    let logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                name: loggerName + '_console',
                json: configuration.log.console.json,
                colorize: !configuration.log.console.json,
                stringify: obj => JSON.stringify(obj),
                timestamp: true,
                level: process.env.ANOTEA_LOG_LEVEL || 'info'
            })
        ]
    });

    if (configuration.log.file.enabled) {
        logger.add(logrotate.Rotate, {
            name: loggerName + '_file_info',
            file: configuration.log.file.info,
            level: 'info',
            json: false,
            timestamp: true,
            size: configuration.log.file.maxSize,
            keep: configuration.log.file.keep,
            compress: configuration.log.file.compress
        });

        logger.add(logrotate.Rotate, {
            name: loggerName + '_file_error',
            file: configuration.log.file.error,
            level: 'error',
            json: false,
            timestamp: true,
            size: configuration.log.file.maxSize,
            keep: configuration.log.file.keep,
            compress: configuration.log.file.compress
        });
    }

    if (configuration.log.sentry.enabled) {
        logger.add(Sentry, {
            name: loggerName + '_sentry',
            level: 'warn',
            config: {
                release: process.env.ANOTEA_RELEASE_VERSION || 'latest',
                environment: 'production'
            },
            dsn: configuration.log.sentry.DSN
        });
    }

    return logger;
};
