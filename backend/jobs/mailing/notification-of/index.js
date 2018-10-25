#!/usr/bin/env node
'use strict';

const moment = require('moment');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');
const createMailerOrganismeWithCommentNonRead = require('./mailerOrganismeWithCommentNonRead');

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-email-campaign-with-at-least-five-not-read-comments', configuration);
    let mailer = require('../../../components/mailer.js')(db, logger, configuration);
    let mailerOrganismeWithCommentNonRead = createMailerOrganismeWithCommentNonRead(db, logger, configuration, mailer);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    try {
        logger.info('Sending emails to organismes...');

        let results = await mailerOrganismeWithCommentNonRead.sendEmails();

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration})`, results);

    } catch (e) {
        abort(e);
    }
};

main();
