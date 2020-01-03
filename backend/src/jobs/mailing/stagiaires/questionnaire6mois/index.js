#!/usr/bin/env node
"use strict";

const cli = require("commander");
const sendQuestionnaire6MoisEmails = require("./tasks/sendQuestionnaire6MoisEmails");
const { execute } = require("../../../job-utils");

cli.description("Envoie du questionnaire à 6 mois")
.option("--limit [limit]", "limit the number of emails sent (default: 1)", parseInt)
.option("--delay [delay]", "Time in milliseconds to wait before sending the next email (default: 100)", parseInt)
.parse(process.argv);

execute(async ({ db, logger, emails }) => {

    let { limit = 1, delay = 100 } = cli;

    logger.info(`Sending questionnaire email to stagiaires...`);
    return sendQuestionnaire6MoisEmails(db, logger, emails, {
        limit,
        delay,
    });
});
