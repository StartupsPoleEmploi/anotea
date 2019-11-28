#!/usr/bin/env node
'use strict';

const cli = require('commander');
const sendAvisEmails = require('./tasks/sendAvisEmails');
const { capitalizeFirstLetter, execute } = require('../../../job-utils');

cli.description('send email campaign')
.option('--campaign [campaign]', 'Limit emailing to the campaign name')
.option('--region [region]', 'Limit emailing to the region')
.option('--type [type]', 'resend,retry,send (default: send))', capitalizeFirstLetter)
.option('--limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
.option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
.option('--slack', 'Send a slack notification when job is finished')
.parse(process.argv);

execute(async ({ logger, db, configuration, emails, regions, sendSlackNotification }) => {

    let type = cli.type || 'Send';
    let ActionClass = require(`./tasks/actions/${type}Action`);
    let action = new ActionClass(configuration, {
        campaign: cli.campaign,
        codeRegions: cli.region ? [cli.region] :
            regions.findActiveRegions('mailing.stagiaires.avis').map(region => region.codeRegion),
    });

    logger.info(`Sending emails to stagiaires (${type})...`);

    try {
        let stats = await sendAvisEmails(db, logger, emails, action, {
            limit: cli.limit,
            delay: cli.delay,
        });

        if (stats.total > 0) {
            sendSlackNotification({
                text: `[STAGIAIRE] Des emails stagiaires ont été envoyés : ` +
                    `${stats.sent} envoyés / ${stats.error} erreurs [${cli.campaign || type}]`,
            });
        }

        return stats;

    } catch (stats) {
        sendSlackNotification({
            text: `[STAGIAIRE] Une erreur est survenue lors de l'envoi des emails aux stagiaires : ` +
                `${stats.sent} envoyés / ${stats.error} erreurs [${cli.campaign || type}]`,
        });
        throw stats;
    }
}, { slack: cli.slack });
