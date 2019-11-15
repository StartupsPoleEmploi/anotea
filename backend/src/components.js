const config = require('config');
const auth = require('./common/components/auth');
const passwords = require('./common/components/passwords');
const getRegions = require('./common/components/regions');
const createLogger = require('./common/components/logger');
const sentry = require('./common/components/sentry');
const workflow = require('./common/components/workflow');
const database = require('./common/components/database');
const communes = require('./common/components/communes');
const createEmails = require('./common/components/emails');
const createTemplates = require('./common/components/emails/templates/templates');
const createMailer = require('./common/components/mailer');

module.exports = async (options = {}) => {

    let configuration = options.configuration || config;
    let logger = options.logger || createLogger('backend', configuration);
    let { client, db } = await database(logger, configuration);
    let regions = getRegions();
    let mailer = options.mailer || createMailer(db, configuration);
    let templates = createTemplates(configuration);
    let emails = createEmails(db, regions, mailer, templates);

    return Object.assign({}, {
        configuration,
        logger,
        db,
        client,
        mailer,
        regions,
        emails,
        templates,
        sentry: sentry(logger, configuration),
        auth: auth(configuration),
        passwords: passwords(configuration),
        workflow: workflow(db, logger, emails),
        communes: communes(db),
    }, options || {});
};
