#!/usr/bin/env node
'use strict';

const cli = require('commander');
const Questionnaire6MoisMailer = require('./tasks/Questionnaire6MoisMailer');
const { execute } = require('../../../job-utils');

cli.description('Envoie du questionnaire à 6 mois')
.option('--limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
.option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
.parse(process.argv);

execute(async ({ db, logger, mailer }) => {

    logger.info(`Sending emails to stagiaires...`);

    let questionnaire6MoisMailer = new Questionnaire6MoisMailer(db, logger, mailer);

    return questionnaire6MoisMailer.sendEmails({
        limit: cli.limit,
        delay: cli.delay,
    });
});
