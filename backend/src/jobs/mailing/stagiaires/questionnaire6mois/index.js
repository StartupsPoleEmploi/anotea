#!/usr/bin/env node
'use strict';

const cli = require('commander');
const sendQuestionnaire6MoisEmails = require('./tasks/sendQuestionnaire6MoisEmails');
const { execute } = require('../../../job-utils');

cli.description('Envoie du questionnaire à 6 mois')
.option('--limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
.option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
.parse(process.argv);

execute(async ({ db, logger, emails }) => {

    logger.info(`Sending emails to stagiaires...`);
    return sendQuestionnaire6MoisEmails(db, logger, emails, {
        limit: cli.limit,
        delay: cli.delay,
    });
});
