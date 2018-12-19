#!/usr/bin/env node
'use strict';

const cli = require('commander');
const NotificationMailer = require('./NotificationMailer');
const { findActiveRegions, execute } = require('../../../job-utils');

execute(async ({ logger, db, configuration, mailer }) => {

    let notificationMailer = new NotificationMailer(db, logger, configuration, mailer);

    cli.description('send notifications to organismes')
    .option('-r, --region [region]', 'Limit emailing to the region')
    .option('-l, --limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
    .option('-d, --delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
    .parse(process.argv);

    logger.info(`Sending emails to organismes...`);
    return notificationMailer.sendEmails({
        limit: cli.limit,
        delay: cli.delay,
        codeRegions: cli.region ? [cli.region] :
            findActiveRegions(configuration.app.active_regions, 'organismes.notifications'),
    });
});
