const config = require('config');
const mongo = require('mongodb');
const auth = require('./common/components/auth');
const regions = require('./common/components/regions');
const createLogger = require('./common/components/logger');
const createMailer = require('./smtp/mailer.js');
const sendForgottenPasswordEmail = require('./common/components/mailing/sendForgottenPasswordEmail.js');
const sendOrganisationAccountEmail = require('./common/components/mailing/sendOrganisationAccountEmail.js');

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
        client,
        mailer,
        auth: auth(configuration),
        regions: regions(db),
        mailing: {
            sendForgottenPasswordEmail: sendForgottenPasswordEmail(db, mailer),
            sendOrganisationAccountEmail: sendOrganisationAccountEmail(db, mailer),
        }
    }, options || {});
};
