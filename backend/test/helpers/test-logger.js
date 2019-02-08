const createLogger = require('../../src/common/components/logger');

module.exports = createLogger({
    log: {
        level: process.env.ANOTEA_LOG_LEVEL || 'fatal',
        console: {
            json: false,
        }
    }
});
