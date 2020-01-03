#!/usr/bin/env node
"use strict";

const cli = require("commander");
const sendOrganismeQuestionnaire = require("./tasks/sendOrganismeQuestionnaire");
const { execute } = require("../../../job-utils");

cli.description("Envoie du questionnaire au organisme")
.option("--limit [limit]", "limit the number of emails sent (default: unlimited)", parseInt)
.option("--delay [delay]", "Time in milliseconds to wait before sending the next email (default: 0)", parseInt)
.parse(process.argv);

execute(async ({ db, logger, emails }) => {

    let { limit = 1, delay = 100 } = cli;

    logger.info(`Sending questionnaire email to organismes...`);
    return sendOrganismeQuestionnaire(db, logger, emails, {
        limit,
        delay,
    });
});
