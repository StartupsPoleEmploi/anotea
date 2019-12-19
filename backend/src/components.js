const config = require('config');
const auth = require('./common/components/auth');
const passwords = require('./common/components/passwords');
const getRegions = require('./common/components/regions');
const createLogger = require('./common/components/logger');
const sentry = require('./common/components/sentry');
const workflow = require('./common/components/workflow');
const database = require('./common/components/database');
const communes = require('./common/components/communes');
const sendForgottenPasswordEmail = require('./common/components/mailing/sendForgottenPasswordEmail');
const sendOrganisationAccountEmail = require('./common/components/mailing/sendOrganisationAccountEmail');
const sendVotreAvisEmail = require('./common/components/mailing/sendVotreAvisEmail');
const sendReponseRejeteeNotification = require('./common/components/mailing/sendReponseRejeteeNotification');
const sendSignalementRejeteNotification = require('./common/components/mailing/sendSignalementRejeteNotification');
const sendSignalementAccepteNotification = require('./common/components/mailing/sendSignalementAccepteNotification');
const sendInjureMail = require('./common/components/mailing/sendInjureMail');
const sendAlerteMail = require('./common/components/mailing/sendAlerteMail');
const createPeconnect = require('./common/components/peconnect');
const createEmails = require('./common/components/emails/emails');
const createMailer = require('./common/components/emails/mailer');

module.exports = async (options = {}) => {

    let configuration = options.configuration || config;
    let logger = options.logger || createLogger('backend', configuration);
    let { client, db } = await database(logger, configuration);
    let regions = getRegions();
    let mailer = options.mailer || createMailer(configuration, regions);
    let emails = createEmails(db, configuration, regions, mailer);

    return Object.assign({}, {
        configuration,
        logger,
        db,
        client,
        regions,
        emails,
        sentry: sentry(logger, configuration),
        auth: auth(configuration),
        passwords: passwords(configuration),
        workflow: workflow(db, logger, emails),
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
