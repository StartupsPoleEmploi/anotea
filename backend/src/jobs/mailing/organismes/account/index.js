#!/usr/bin/env node
'use strict';

const cli = require('commander');
const _ = require('lodash');
const sendActivationCompteEmails = require('./tasks/sendActivationCompteEmails');
const { capitalizeFirstLetter, execute } = require('../../../job-utils');

cli.description('Send new account emails')
.option('--siret [siret]', 'Siret of a specific organisme')
.option('--region [region]', 'Limit emailing to the region')
.option('--responsable', 'if present, send notification to organismes responsable instead')
.option('--type [type]', 'resend,send (default: send))', capitalizeFirstLetter)
.option('--limit [limit]', 'limit the number of emails sent (default: 1)', parseInt)
.option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 100)', parseInt)
.option('--slack', 'Send a slack notification when job is finished')
.parse(process.argv);

execute(async ({ logger, db, configuration, emails, regions, sendSlackNotification }) => {

    let { type = 'send', siret, region, responsable = false, limit = 1, delay = 100 } = cli;

    logger.info('Sending activation email to new organismes...');

    let ActionClass = require(`./tasks/actions/${_.capitalize(type)}Action`);
    let action = new ActionClass(configuration, {
        codeRegions: region ? [region] :
            regions.findActiveRegions('mailing.organismes.accounts').map(region => region.codeRegion),
        responsable: responsable,
    });

    try {
        let stats = await sendActivationCompteEmails(db, logger, emails, action, {
            siret,
            limit,
            delay,
        });

        if (stats.total > 0) {
            sendSlackNotification({
                text: `[ORGANISME] Des emails de création de compte ont été envoyés à des organismes :  ` +
                    `${stats.sent} envoyés / ${stats.error} erreurs`,
            });
        }

        return stats;
    } catch (stats) {
        sendSlackNotification({
            text: `[ORGANISME] Une erreur est survenue lors de l'envoi des emails de création de compte aux organismes : ` +
                `${stats.sent} envoyés / ${stats.error} erreurs`,
        })
        ;
        throw stats;
    }
}, { slack: cli.slack });
