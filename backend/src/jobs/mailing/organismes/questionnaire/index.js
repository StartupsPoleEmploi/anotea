#!/usr/bin/env node
'use strict';

const cli = require('commander');
const sendOrganismeQuestionnaire = require('./tasks/sendOrganismeQuestionnaire');
const { execute } = require('../../../job-utils');

cli.description('Envoie du questionnaire au organisme')
.option('--limit [limit]', 'limit the number of emails sent (default: unlimited)', parseInt)
.option('--delay [delay]', 'Time in milliseconds to wait before sending the next email (default: 0)', parseInt)
.parse(process.argv);

execute(async ({ db, logger, emails }) => {

    let { createQuestionnaireOrganismeEmail } = emails;

    logger.info(`Sending emails to organismes...`);
    return sendOrganismeQuestionnaire(db, logger, createQuestionnaireOrganismeEmail, {
        limit: cli.limit,
        delay: cli.delay,
    });
});
