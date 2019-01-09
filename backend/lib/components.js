const config = require('config');
const auth = require('./common/components/auth');
const regions = require('./common/components/regions');
const createLogger = require('./common/components/logger');
const database = require('./common/components/database');
const createMailer = require('./smtp/mailer.js');
const sendForgottenPasswordEmail = require('./common/components/mailing/sendForgottenPasswordEmail.js');
const sendOrganisationAccountEmail = require('./common/components/mailing/sendOrganisationAccountEmail.js');
const sendTraineeFormEmail = require('./common/components/mailing/sendTraineeFormEmail');

module.exports = async (options = {}) => {

    let configuration = options.configuration || config;
    let logger = options.logger || createLogger('anotea-server', configuration);
    let { client, db } = await database(logger, configuration);
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
            sendTraineeFormEmail: sendTraineeFormEmail(db, mailer),
        }
    }, options || {});
};
