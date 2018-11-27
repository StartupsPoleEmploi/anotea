#!/usr/bin/env node
'use strict';

const cli = require('commander');
const moment = require('moment');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');
const createCampaignMailer = require('./campaignMailer');

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-email-campaign', configuration);
    let mailer = require('../../../components/mailer.js')(db, logger, configuration);

    cli.description('send email campaign')
    .option('-c, --campaign [campaign]', 'Limit emailing to the campaign name')
    .option('-r, --region [region]', 'Limit emailing to the region')
    .option('-t, --type [type]', 'resend,retry,send (default: send))')
    .parse(process.argv);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    let type = cli.type || 'send';
    let regions = configuration.app.active_regions.map(e => e.code_region);
    if (cli.region && !regions.includes(cli.region)) {
        return abort('Region is not active');
    }

    let filters = { campaign: cli.campaign, codeRegion: cli.region, limit: 1 };
    let handler = require(`./handlers/${type}Handler`)(db, configuration);
    let campaignMailer = createCampaignMailer(db, logger, mailer);

    try {
        logger.info(`Sending emails to stagiaires (${type})...`);

        let results = await campaignMailer.sendEmails(handler, filters);

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`, results);

    } catch (e) {
        abort(e);
    }

};

main();
