const server = require('./lib/http/server');
const createComponents = require('./lib/common/createComponents');

process.on('uncaughtException', err => console.log(err));

const main = async () => {

    let components = await createComponents();
    let app = server(components);

    let httpServer = app.listen(components.configuration.app.port, () => {
        const address = httpServer.address();
        components.logger.info('Listening to http://%s:%s', address.address, address.port);
    });
};

main();
