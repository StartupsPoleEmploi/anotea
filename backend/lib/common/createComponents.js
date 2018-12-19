const config = require('config');
const mongo = require('mongodb');
const AuthService = require('./components/AuthService');
const createRegions = require('./components/regions');
const createLogger = require('./createLogger');
const createMailer = require('../smtp/createMailer.js');
const sendForgottenPasswordEmail = require('./components/sendForgottenPasswordEmail.js');
const sendOrganisationAccountEmail = require('./components/sendOrganisationAccountEmail.js');

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
    let logger = options.logger || createLogger('anotea-server', configuration);
    let client = await connectToMongoDB(logger, configuration);
    let db = client.db();
    let mailer = options.mailer || createMailer(db, logger, configuration);

    return Object.assign({}, {
        configuration,
        logger,
        db,
        mailer,
        authService: new AuthService(logger, configuration),
        regions: createRegions(db),
        sendForgottenPasswordEmail: sendForgottenPasswordEmail(db, mailer),
        sendOrganisationAccountEmail: sendOrganisationAccountEmail(db, mailer),
    }, options || {});
};
