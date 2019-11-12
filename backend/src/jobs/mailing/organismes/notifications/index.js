#!/usr/bin/env node
'use strict';

const cli = require('commander');
const NotificationMailer = require('./NotificationMailer');
const { execute } = require('../../../job-utils');

cli.description('send notifications to organismes')
.option('--region [region]', 'Limit emailing to the region')
.option('--limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
.option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
.option('--slack', 'Send a slack notification when job is finished')
.parse(process.argv);

execute(async ({ logger, db, configuration, emails, regions, sendSlackNotification }) => {

    let { organismeNotificationEmail } = emails;
    let notificationMailer = new NotificationMailer(db, logger, configuration, organismeNotificationEmail);

    logger.info(`Sending emails to organismes...`);

    try {
        let stats = await notificationMailer.sendEmails({
            limit: cli.limit,
            delay: cli.delay,
            codeRegions: cli.region ? [cli.region] :
                regions.findActiveRegions('mailing.organismes.notifications').map(region => region.codeRegion),
        });

        if (stats.total > 0) {
            sendSlackNotification({
                text: `[ORGANISME] Des emails de notifications de nouveaux avis ont été envoyés à des organismes` +
                    `${stats.sent} envoyés / ${stats.error} erreurs`,
            });
        }

        return stats;
    } catch (stats) {
        sendSlackNotification({
            text: `[ORGANISME] Une erreur est survenue lors de l'envoi des emails de notifications d'avis aux organismes : ` +
                `${stats.sent} envoyés / ${stats.error} erreurs`,
        });
        throw stats;
    }
}, { slack: cli.slack });
