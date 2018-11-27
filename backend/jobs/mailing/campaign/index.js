#!/usr/bin/env node
'use strict';

const cli = require('commander');
const moment = require('moment');
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

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-email-campaign', configuration);
    let mailer = require('../../../components/mailer.js')(db, logger, configuration);

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

    let filters = { campaign: cli.campaign, codeRegion: cli.region, limit: 1 };

    try {
        logger.info('Sending emails to stagiaires...');

        let results;
        if (cli.resend) {
            results = await require('./resendCampaignMailer.js')(db, logger, configuration, mailer, filters);
        } else if (cli.retry) {
            results = await require('./retryCampaignMailer.js')(db, logger, configuration, mailer, filters);
        } else {
            results = await require('./campaignMailer')(db, logger, configuration, mailer, filters);
        }

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`, results);

    } catch (e) {
        abort(e);
    }

};

main();
