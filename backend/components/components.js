const config = require('config');
const mongo = require('mongodb');
const getLogger = require('./logger');
const AuthService = require('./AuthService');
const createRegions = require('../components/regions');
const createMailer = require('./mailer.js');
const sendForgottenPasswordEmail = require('./sendForgottenPasswordEmail.js');

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

    let configuration = options.configuration || config;
    let logger = getLogger('anotea-server', configuration);
    let client = await connectToMongoDB(logger, configuration);
    let db = client.db();
    let mailer = createMailer(db, logger, configuration);

    return Object.assign({}, {
        db,
        logger,
        mailer,
        configuration,
        authService: new AuthService(logger, configuration),
        regions: createRegions(db),
        sendForgottenPasswordEmail: sendForgottenPasswordEmail(db, logger, mailer),
    }, options.context || {});
};
