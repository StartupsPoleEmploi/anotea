const server = require('./src/http/server');
const createComponents = require('./src/core/components');

process.on('unhandledRejection', e => console.log(e));
process.on('uncaughtException', e => console.log(e));

const main = async () => {

    let components = await createComponents();

    let app = server(components, { swagger: true });

    let httpServer = app.listen(components.configuration.app.port, () => {
        const address = httpServer.address();
        components.logger.info('Listening to http://%s:%s', address.address, address.port);
    });
};

main();
