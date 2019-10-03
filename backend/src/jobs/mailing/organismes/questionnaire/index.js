#!/usr/bin/env node
'use strict';

const cli = require('commander');
const QuestionnaireOrganismeMailer = require('./tasks/QuestionnaireOrganismeMailer');
const { execute } = require('../../../job-utils');

cli.description('Envoie du questionnaire au organisme')
.option('--limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
.option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
.parse(process.argv);

execute(async ({ db, logger, mailer }) => {

    logger.info(`Sending emails to organismes...`);

    return new QuestionnaireOrganismeMailer(db, logger, mailer).sendEmails({
        limit: cli.limit,
        delay: cli.delay,
    });
});
