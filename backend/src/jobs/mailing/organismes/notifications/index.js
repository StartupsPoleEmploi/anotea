#!/usr/bin/env node
'use strict';

const cli = require('commander');
const NotificationMailer = require('./NotificationMailer');
const { execute } = require('../../../job-utils');

execute(async ({ logger, db, configuration, mailer, regions, sendSlackNotification }) => {

    let notificationMailer = new NotificationMailer(db, logger, configuration, mailer);

    cli.description('send notifications to organismes')
    .option('--region [region]', 'Limit emailing to the region')
    .option('--limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
    .option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
    .option('--slackWebhookUrl [slackWebhookUrl]', 'Send a slack notification when job is finished')
    .parse(process.argv);

    logger.info(`Sending emails to organismes...`);

    try {
        let results = await notificationMailer.sendEmails({
            limit: cli.limit,
            delay: cli.delay,
            codeRegions: cli.region ? [cli.region] :
                regions.findActiveRegions('mailing.organismes.notifications').map(region => region.codeRegion),
        });

        sendSlackNotification({
            webhookUrl: cli.slackWebhookUrl,
            message: {
                text: `${results.sent} emails de notifications de nouveaux avis envoyés à des organismes` +
                    `(Nombre d'erreurs : ${results.error})`,
            },
        });

        return results;
    } catch (e) {
        sendSlackNotification({
            webhookUrl: cli.slackWebhookUrl,
            message: {
                text: `Les emails de notifications d'avis n'ont pas pu être envoyés`,
            },
        });
        throw e;
    }
});
