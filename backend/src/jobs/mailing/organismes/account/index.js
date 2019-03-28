#!/usr/bin/env node
'use strict';

const cli = require('commander');
const AccountMailer = require('./AccountMailer');
const { capitalizeFirstLetter, execute } = require('../../../job-utils');

execute(({ logger, db, configuration, mailer, regions }) => {

    let accountMailer = new AccountMailer(db, logger, configuration, mailer);

    cli.description('Send new account emails')
    .option('-s, --siret [siret]', 'Siret of a specific organisme')
    .option('-r, --region [region]', 'Limit emailing to the region')
    .option('-t, --type [type]', 'resend,send (default: send))', capitalizeFirstLetter)
    .option('-l, --limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
    .option('-d, --delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
    .parse(process.argv);

    let type = cli.type || 'Send';
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

        return accountMailer.sendEmails(action, options);
    }
});
