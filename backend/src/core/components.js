const config = require("config");
const auth = require("./components/auth");
const passwords = require("./components/passwords");
const getRegions = require("./components/regions");
const createLogger = require("./components/logger");
const sentry = require("./components/sentry");
const workflow = require("./components/workflow");
const database = require("./components/database");
const communes = require("./components/communes");
const createPeconnect = require("./components/peconnect");
const createEmails = require("./components/emails/emails");
const createMailer = require("./components/emails/mailer");

module.exports = async (options = {}) => {

    let configuration = options.configuration || config;
    let logger = options.logger || createLogger("backend", configuration);
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
        peconnect: createPeconnect(db, configuration)
    }, options || {});
};
