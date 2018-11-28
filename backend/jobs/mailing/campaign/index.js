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
    .option('-c, --campaign [campaign]', 'Limit emailing to the campaign name')
    .option('-r, --region [region]', 'Limit emailing to the region')
    .option('-s, --resend', 'Resend an email to trainee that did\'nt submit an advice')
    .option('-t, --retry', 'Resend every email with an SMTP error')
    .parse(process.argv);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    let regions = configuration.app.active_regions.map(e => e.code_region);
    if (cli.region && !regions.includes(cli.region)) {
        return abort('Region is not active');
    }

    let filters = { campaign: cli.campaign, codeRegion: cli.region };

    if (cli.resend) {
        require('./resendCampaignMailer.js')(db, logger, configuration, filters);
    } else if (cli.retry) {
        require('./retryCampaignMailer.js')(db, logger, configuration, filters);
    } else {
        require('./campaignMailer')(db, logger, configuration, filters);
    }
};

main();
