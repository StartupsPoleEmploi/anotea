const winston = require('winston');

module.exports = new winston.Logger({
    transports: [
        new winston.transports.Console({
            name: 'console',
            colorize: true,
            timestamp: true,
            level: process.env.ANOTEA_LOG_LEVEL || 'fatal'
        }),
    ]
});
