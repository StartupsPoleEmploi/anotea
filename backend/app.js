const configuration = require('config');
const getLogger = require('./components/logger');
const createExpressApp = require('./createExpressApp');

let logger = getLogger('anotea-server', configuration);

process.on('uncaughtException', err => {
    logger.error(err);
    process.exit(1);
});

const main = async () => {
    let app = await createExpressApp(logger, configuration);
    let httpServer = app.listen(configuration.app.port, () => {
        const address = httpServer.address();
        logger.info('Listening to http://%s:%s', address.address, address.port);
    });
};

main();
