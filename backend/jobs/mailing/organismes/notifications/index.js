#!/usr/bin/env node
'use strict';

const cli = require('commander');
const moment = require('moment');
const configuration = require('config');
const getMongoClient = require('../../../../components/mongodb');
const getLogger = require('../../../../components/logger');
const NotificationMailer = require('./NotificationMailer');
const { findActiveRegions } = require('../../../job-utils');

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-email-campaign-with-at-least-five-not-read-comments', configuration);
    let mailer = require('../../../../components/mailer.js')(db, logger, configuration);
    let notificationMailer = new NotificationMailer(db, logger, configuration, mailer);

    cli.description('send notifications to organismes')
    .option('-r, --region [region]', 'Limit emailing to the region')
    .option('-l, --limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
    .option('-d, --delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
    .parse(process.argv);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    try {
        logger.info(`Sending emails to organismes...`);
        let results = await notificationMailer.sendEmails({
            limit: cli.limit,
            delay: cli.delay,
            codeRegions: cli.region ? [cli.region] :
                findActiveRegions(configuration.app.active_regions, 'organismes.notifications'),
        });

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration})`, results);

        await client.close();

    } catch (e) {
        abort(e);
    }
};

main();
