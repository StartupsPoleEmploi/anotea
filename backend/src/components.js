const config = require('config');
const auth = require('./common/components/auth');
const passwords = require('./common/components/passwords');
const getRegions = require('./common/components/regions');
const createLogger = require('./common/components/logger');
const sentry = require('./common/components/sentry');
const moderation = require('./common/components/moderation');
const consultation = require('./common/components/consultation');
const database = require('./common/components/database');
const communes = require('./common/components/communes');
const createMailer = require('./smtp/mailer');
const sendForgottenPasswordEmail = require('./common/components/mailing/sendForgottenPasswordEmail');
const sendOrganisationAccountEmail = require('./common/components/mailing/sendOrganisationAccountEmail');
const sendVotreAvisEmail = require('./common/components/mailing/sendVotreAvisEmail');
const sendReponseRejeteeNotification = require('./common/components/mailing/sendReponseRejeteeNotification');
const sendSignalementRejeteNotification = require('./common/components/mailing/sendSignalementRejeteNotification');
const sendSignalementAccepteNotification = require('./common/components/mailing/sendSignalementAccepteNotification');
const sendInjureMail = require('./common/components/mailing/sendInjureMail');
const sendAlerteMail = require('./common/components/mailing/sendAlerteMail');
const createPeconnect = require('./common/components/peconnect');

module.exports = async (options = {}) => {

    let configuration = options.configuration || config;
    let logger = options.logger || createLogger('backend', configuration);
    let { client, db } = await database(logger, configuration);
    let regions = getRegions();
    let mailer = options.mailer || createMailer(db, logger, configuration, regions);

    return Object.assign({}, {
        configuration,
        logger,
        db,
        client,
        mailer,
        sentry: sentry(logger, configuration),
        auth: auth(configuration),
        passwords: passwords(configuration),
        regions: regions,
        moderation: moderation(db),
        consultation: consultation(db),
        communes: communes(db),
        mailing: {
            sendForgottenPasswordEmail: sendForgottenPasswordEmail(db, mailer),
            sendOrganisationAccountEmail: sendOrganisationAccountEmail(db, mailer),
            sendVotreAvisEmail: sendVotreAvisEmail(db, mailer),
            sendReponseRejeteeNotification: sendReponseRejeteeNotification(db, mailer, logger),
            sendSignalementRejeteNotification: sendSignalementRejeteNotification(db, mailer, logger),
            sendSignalementAccepteNotification: sendSignalementAccepteNotification(db, mailer, logger),
            sendInjureMail: sendInjureMail(db, mailer, logger),
            sendAlerteMail: sendAlerteMail(db, mailer, logger)
        },
        peconnect: createPeconnect(configuration)
    }, options || {});
};
