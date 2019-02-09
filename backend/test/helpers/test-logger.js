const createLogger = require('../../src/common/components/logger');

module.exports = createLogger('anotea-test', {
    log: {
        level: process.env.ANOTEA_LOG_LEVEL || 'fatal',
        json: false,
    }
});
