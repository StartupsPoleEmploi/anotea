#!/usr/bin/env node
'use strict';

const cli = require('commander');
const AccountMailer = require('./AccountMailer');
const { capitalizeFirstLetter, execute } = require('../../../job-utils');

cli.description('Send new account emails')
.option('--siret [siret]', 'Siret of a specific organisme')
.option('--region [region]', 'Limit emailing to the region')
.option('--type [type]', 'resend,send (default: send))', capitalizeFirstLetter)
.option('--limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
.option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
.option('--slack', 'Send a slack notification when job is finished')
.parse(process.argv);

execute(async ({ logger, db, configuration, emails, regions, sendSlackNotification }) => {

    let type = cli.type || 'Send';
    let accountMailer = new AccountMailer(db, logger, emails.organismeAccountEmail);
    let options = {
        limit: cli.limit,
        delay: cli.delay,
    };

    logger.info('Sending emails to new organismes...');

    if (cli.siret) {
        return accountMailer.sendEmailBySiret(cli.siret, options);
    } else {
        let ActionClass = require(`./actions/${type}Action`);
        let action = new ActionClass(configuration, {
            codeRegions: cli.region ? [cli.region] :
                regions.findActiveRegions('mailing.organismes.accounts').map(region => region.codeRegion),
        });

        try {
            let stats = await accountMailer.sendEmails(action, options);

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
    }
}, { slack: cli.slack });
