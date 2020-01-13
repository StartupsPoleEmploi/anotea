#!/usr/bin/env node
'use strict';

const cli = require('commander');
const sendNotificationEmails = require('./tasks/sendNotificationEmails');
const { execute } = require('../../../job-utils');

cli.description('send notifications to organismes')
.option('--region [region]', 'Limit emailing to the region')
.option('--limit [limit]', 'limit the number of emails sent (default: 1)', parseInt)
.option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 100)', parseInt)
.option('--slack', 'Send a slack notification when job is finished')
.parse(process.argv);

execute(async ({ logger, db, configuration, regions, emails, sendSlackNotification }) => {

    let { region, limit = 1, delay = 100 } = cli;

    logger.info(`Sending notification email to organismes...`);

    try {
        let stats = await sendNotificationEmails(db, logger, configuration, emails, {
            limit,
            delay,
            codeRegions: region ? [region] :
                regions.findActiveRegions('mailing.organismes.notifications').map(region => region.codeRegion),
        });

        if (stats.total > 0) {
            sendSlackNotification({
                text: `[ORGANISME] Des emails de notifications de nouveaux avis ont été envoyés à des organismes ` +
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
