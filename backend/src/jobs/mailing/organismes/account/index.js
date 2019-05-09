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

execute(async ({ logger, db, configuration, mailer, regions, sendSlackNotification }) => {

    let type = cli.type || 'Send';
    let accountMailer = new AccountMailer(db, logger, configuration, mailer);
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
            let results = await accountMailer.sendEmails(action, options);

            sendSlackNotification({
                text: `${results.sent} emails de création de compte envoyés à des organismes` +
                    `(Nombre d'erreurs : ${results.error})`,
            });

            return results;
        } catch (e) {
            sendSlackNotification({
                text: `Les emails de création de compte pour les organismes n'ont pas pu être envoyés`,
            });
            throw e;
        }
    }
}, { slack: cli.slack });
