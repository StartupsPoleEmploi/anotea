const configuration = require('config');
const mongo = require('mongodb');
const getLogger = require('./logger');
const AuthService = require('./AuthService');

const connectToMongoDB = (logger, configuration) => {
    return new Promise(resolve => {
        mongo.connect(configuration.mongodb.uri, { useNewUrlParser: true }, (err, client) => {
            if (err) {
                logger.error('Failed to connect to MongoDB - retrying in 5 sec', err.message);
                //TODO we should add a maxRetry
                return setTimeout(() => connectToMongoDB(logger, configuration), 5000);
            }
            resolve(client);
        });
    });
};

module.exports = async (options = {}) => {

    let conf = options.configuration || configuration;
    let logger = getLogger('anotea-server', conf);
    let client = await connectToMongoDB(logger, conf);
    let db = client.db();

    return Object.assign({}, {
        db,
        logger,
        configuration: conf,
        authService: new AuthService(logger, conf),
    }, options.context || {});
};
