#!/usr/bin/env node
'use strict';

const moment = require('moment');
const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../../../components/mongodb');
const getLogger = require('../../../../components/logger');
const AccountMailer = require('./AccountMailer');
const { findActiveRegions, capitalizeFirstLetter } = require('../../../job-utils');

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-mailing-account', configuration);
    let mailer = require('../../../../components/mailer.js')(db, logger, configuration);
    let accountMailer = new AccountMailer(db, logger, configuration, mailer);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    cli.description('Send new account emails')
    .option('-s, --siret [siret]', 'Siret of a specific organisme')
    .option('-r, --region [region]', 'Limit emailing to the region')
    .option('-t, --type [type]', 'resend,send (default: send))', capitalizeFirstLetter)
    .option('-l, --limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
    .option('-d, --delay [delay]', 'Time in seconds to wait before sending the next email (default: 0s)', parseInt)
    .parse(process.argv);

    let type = cli.type || 'Send';
    let options = {
        limit: cli.limit,
        delay: cli.delay,
    };

    try {
        logger.info('Sending emails to new organismes...');

        let results;
        if (cli.siret) {
            results = await accountMailer.sendEmailBySiret(cli.siret, options);
        } else {
            let ActionClass = require(`./actions/${type}Action`);
            let action = new ActionClass(configuration, {
                codeRegions: cli.region ? [cli.region] :
                    findActiveRegions(configuration.app.active_regions, 'organismes.accounts'),
            });

            results = await accountMailer.sendEmails(action, options);
        }

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration})`, results);

    } catch (e) {
        abort(e);
    }
};

main();
