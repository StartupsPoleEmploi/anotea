#!/usr/bin/env node
'use strict';

const moment = require('moment');
const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');
const createNewOrganismeMailer = require('./newOrganismeMailer');

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-mailing-account', configuration);
    let mailer = require('../../../components/mailer.js')(db, logger, configuration);
    let newOrganismeMailer = createNewOrganismeMailer(db, logger, configuration, mailer);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    cli.description('Send new account emails')
    .option('-r, --region [region]', 'The region code')
    .option('-s, --siret [siret]', 'Siret of a specific organisme')
    .option('-e, --resend', 'Resend an email to trainee that did\'nt create an account')
    .parse(process.argv);

    if (!cli.region && !cli.siret) {
        return abort('Invalid arguments');
    }

    try {
        logger.info('Sending emails to new organismes...');

        let results;
        if (cli.siret) {
            results = await newOrganismeMailer.sendEmailBySiret(cli.siret);
        } else {

            let regions = configuration.app.active_regions.map(e => e.code_region);
            if (!regions.includes(cli.region)) {
                return abort('Region is not active');
            }

            if (cli.resend) {
                results = await resend.sendEmails();
            } else {
                results = await newOrganismeMailer.sendEmailsByRegion(cli.region);
            }
        }

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration})`, results);

    } catch (e) {
        abort(e);
    }
};

main();
