const config = require('config');
const auth = require('./common/components/auth');
const passwords = require('./common/components/passwords');
const getRegions = require('./common/components/regions');
const createLogger = require('./common/components/logger');
const sentry = require('./common/components/sentry');
const workflow = require('./common/components/workflow');
const database = require('./common/components/database');
const communes = require('./common/components/communes');
const createMailer = require('./smtp/mailer');
const sendReponseRejeteeNotification = require('./common/components/mailing/sendReponseRejeteeNotification');
const sendSignalementRejeteNotification = require('./common/components/mailing/sendSignalementRejeteNotification');
const sendSignalementAccepteNotification = require('./common/components/mailing/sendSignalementAccepteNotification');
const sendInjureMail = require('./common/components/mailing/sendInjureMail');
const sendAlerteMail = require('./common/components/mailing/sendAlerteMail');
const organismeNotificationEmail = require('./common/components/emails/organismeNotificationEmail');
const forgottenPasswordEmail = require('./common/components/emails/forgottenPasswordEmail');
const organismeAccountEmail = require('./common/components/emails/organismeAccountEmail');
const votreAvisEmail = require('./common/components/emails/votreAvisEmail');

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
        workflow: workflow(db),
        communes: communes(db),
        mailing: {
            sendReponseRejeteeNotification: sendReponseRejeteeNotification(db, mailer, logger),
            sendSignalementRejeteNotification: sendSignalementRejeteNotification(db, mailer, logger),
            sendSignalementAccepteNotification: sendSignalementAccepteNotification(db, mailer, logger),
            sendInjureMail: sendInjureMail(db, mailer, logger),
            sendAlerteMail: sendAlerteMail(db, mailer, logger)
        },
        emails: {
            organismeAccountEmail: organismeAccountEmail(db, mailer, configuration, regions),
            forgottenPasswordEmail: forgottenPasswordEmail(db, mailer, configuration, regions),
            organismeNotificationEmail: organismeNotificationEmail(db, mailer, configuration, regions),
            votreAvisEmail: votreAvisEmail(db, mailer, configuration, regions),
        }
    }, options || {});
};
