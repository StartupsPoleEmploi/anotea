#!/usr/bin/env node
'use strict';

const cli = require('commander');
const moment = require('moment');
const configuration = require('config');
const getMongoClient = require('../../../../components/mongodb');
const getLogger = require('../../../../components/logger');
const TraineeMailer = require('./AvisMailer');
const { findActiveRegions, capitalizeFirstLetter, catchUnexpectedErrors } = require('../../../job-utils');

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-email-campaign', configuration);
    let mailer = require('../../../../components/mailer.js')(db, logger, configuration);

    cli.description('send email campaign')
    .option('-c, --campaign [campaign]', 'Limit emailing to the campaign name')
    .option('-r, --region [region]', 'Limit emailing to the region')
    .option('-t, --type [type]', 'resend,retry,send (default: send))', capitalizeFirstLetter)
    .option('-l, --limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
    .option('-d, --delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
    .parse(process.argv);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    catchUnexpectedErrors(abort);

    let type = cli.type || 'Send';
    let traineeMailer = new TraineeMailer(db, logger, mailer);
    let ActionClass = require(`./actions/${type}Action`);
    let action = new ActionClass(configuration, {
        campaign: cli.campaign,
        codeRegions: cli.region ? [cli.region] : findActiveRegions(configuration.app.active_regions, 'stagiaires.avis'),
    });

    try {
        logger.info(`Sending emails to stagiaires (${type})...`);

        let results = await traineeMailer.sendEmails(action, {
            limit: cli.limit,
            delay: cli.delay,
        });

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`, results);

    } catch (e) {
        abort(e);
    }

};

main();
