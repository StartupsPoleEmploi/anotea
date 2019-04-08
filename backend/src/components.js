const config = require('config');
const auth = require('./common/components/auth');
const password = require('./common/components/password');
const stats = require('./common/components/stats');
const getRegions = require('./common/components/regions');
const createLogger = require('./common/components/logger');
const sentry = require('./common/components/sentry');
const moderation = require('./common/components/moderation');
const database = require('./common/components/database');
const createMailer = require('./smtp/mailer.js');
const sendForgottenPasswordEmail = require('./common/components/mailing/sendForgottenPasswordEmail.js');
const sendOrganisationAccountEmail = require('./common/components/mailing/sendOrganisationAccountEmail.js');
const sendVotreAvisEmail = require('./common/components/mailing/sendVotreAvisEmail');

module.exports = async (options = {}) => {

    let configuration = options.configuration || config;
    let logger = options.logger || createLogger('anotea', configuration);
    let { client, db } = await database(logger, configuration);
    let mailer = options.mailer || createMailer(db, logger, configuration);
    let regions = getRegions();

    return Object.assign({}, {
        configuration,
        logger,
        db,
        client,
        mailer,
        sentry: sentry(logger, configuration),
        auth: auth(configuration),
        password,
        regions: regions,
        stats: stats(db, regions),
        moderation: moderation(db, logger, mailer),
        mailing: {
            sendForgottenPasswordEmail: sendForgottenPasswordEmail(db, mailer),
            sendOrganisationAccountEmail: sendOrganisationAccountEmail(db, mailer),
            sendVotreAvisEmail: sendVotreAvisEmail(db, mailer),
        }
    }, options || {});
};
