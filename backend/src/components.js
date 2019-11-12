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
const organismeNotificationEmail = require('./common/components/emails/organismeNotificationEmail');
const forgottenPasswordEmail = require('./common/components/emails/forgottenPasswordEmail');
const organismeAccountEmail = require('./common/components/emails/organismeAccountEmail');
const votreAvisEmail = require('./common/components/emails/votreAvisEmail');
const avisReponseRejectedEmail = require('./common/components/emails/avisReponseRejectedEmail');
const avisReportedToValidatedEmail = require('./common/components/emails/avisReportedToValidatedEmail');
const avisReportedToRejectedEmail = require('./common/components/emails/avisReportedToRejectedEmail');
const avisInjureEmail = require('./common/components/emails/avisInjureEmail');
const avisAlerteEmail = require('./common/components/emails/avisAlerteEmail');

module.exports = async (options = {}) => {

    let configuration = options.configuration || config;
    let logger = options.logger || createLogger('backend', configuration);
    let { client, db } = await database(logger, configuration);
    let regions = getRegions();
    let mailer = options.mailer || createMailer(db, logger, configuration, regions);
    let emails = {
        forgottenPasswordEmail: forgottenPasswordEmail(db, mailer, configuration, regions),
        organismeAccountEmail: organismeAccountEmail(db, mailer, configuration, regions),
        organismeNotificationEmail: organismeNotificationEmail(db, mailer, configuration, regions),
        votreAvisEmail: votreAvisEmail(db, mailer, configuration, regions),
        avisReponseRejectedEmail: avisReponseRejectedEmail(db, mailer, configuration, regions),
        avisReportedToValidatedEmail: avisReportedToValidatedEmail(db, mailer, configuration, regions),
        avisReportedToRejectedEmail: avisReportedToRejectedEmail(db, mailer, configuration, regions),
        avisInjureEmail: avisInjureEmail(db, mailer, configuration, regions),
        avisAlerteEmail: avisAlerteEmail(db, mailer, configuration, regions),
    };

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
        workflow: workflow(db, logger, emails),
        communes: communes(db),
        emails,
    }, options || {});
};
