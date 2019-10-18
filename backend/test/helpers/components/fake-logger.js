const createLogger = require('../../../src/common/components/logger');

module.exports = createLogger('test', {
    log: {
        level: process.env.ANOTEA_LOG_LEVEL || 'fatal',
        json: false,
    }
});
