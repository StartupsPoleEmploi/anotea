#!/usr/bin/env node
'use strict';

const moment = require('moment');
const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../../../components/mongodb');
const getLogger = require('../../../../components/logger');
const AccountMailer = require('./AccountMailer');
const ResendAccountMailer = require('./ResendAccountMailer');

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-mailing-account', configuration);
    let mailer = require('../../../../components/mailer.js')(db, logger, configuration);
    let accountMailer = new AccountMailer(db, logger, configuration, mailer);
    let resendAccountMailer = new ResendAccountMailer(db, logger, configuration, mailer);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    cli.description('Send new account emails')
    .option('-s, --siret [siret]', 'Siret of a specific organisme')
    .option('-e, --resend', 'Resend an email to organismes that did\'nt create an account')
    .option('-l, --limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
    .option('-d, --delay [delay]', 'Time in seconds to wait before sending the next email (default: 0s)', parseInt)
    .parse(process.argv);

    if (!cli.region && !cli.siret) {
        return abort('Invalid arguments');
    }

    let regions = configuration.app.active_regions.map(e => e.code_region);
    if (cli.region && !regions.includes(cli.region)) {
        return abort('Region is not active');
    }

    let options = {
        limit: cli.limit,
        delay: cli.delay,
    };
    try {
        logger.info('Sending emails to new organismes...');

        let results;
        if (cli.siret) {
            results = await accountMailer.sendEmailBySiret(cli.siret, options);
        } else if (cli.resend) {
            results = await resendAccountMailer.resendEmails(options);
        } else {
            results = await accountMailer.sendEmails(options);
        }


        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration})`, results);

    } catch (e) {
        abort(e);
    }
};

main();
