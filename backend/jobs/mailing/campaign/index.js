#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');

/**
 *   Can be launched with the following command
 *   `node jobs/mailing/campaign [resend] [retry]`
 *
 *   default : send email to trainee
 *
 *   resend is optional (default false) and is a boolean : if true resend an email to trainee that did'nt submit an advice
 *   retry is optional (default false) and is a boolean : if true resend every email with an SMTP error
 *
 *   Warning: default, resend and retry parameters are exclusive.
 **/
const main = async () => {
    const client = await getMongoClient(configuration.mongodb.uri);
    const db = client.db();
    const logger = getLogger('anotea-job-email-campaign', configuration);

    cli.description('send email campaign')
    .option('-s, --resend', 'Resend an email to trainee that did\'nt submit an advice')
    .option('-t, --retry', 'Resend every email with an SMTP error')
    .parse(process.argv);

    if (cli.resend) {
        require('./mailerCampaignResend.js')(db, logger, configuration);
    } else if (cli.retry) {
        require('./mailerCampaignRetry.js')(db, logger, configuration);
    } else {
        require('./mailerCampaign')(db, logger, configuration);
    }
};

main();
