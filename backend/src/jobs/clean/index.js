#!/usr/bin/env node
'use strict';
const cli = require('commander');
const { execute } = require('../job-utils');
const removeOldStagiaires = require('./tasks/removeOldStagiaires');

cli.description('Supprime données inutiles')
.option('--slack', 'Send a slack notification when job is finished')
.parse(process.argv);

execute(async ({ db, logger, sendSlackNotification }) => {

    const stats = removeOldStagiaires(db, logger);

    if (stats.deletedMailSentNoDate > 0) {
        sendSlackNotification({
            text: `[STAGIAIRES] ${stats.deletedMailSentNoDate} stagiaires contactés sans date de contact ont été supprimés`,
        });
    }
    if (stats.deletedMailSentTooOld > 0) {
        sendSlackNotification({
            text: `[STAGIAIRES] ${stats.deletedMailSentTooOld} stagiaires contactés il y a plus d'un an ont été supprimés`,
        });
    }
    if (stats.deletedMailNotSent > 0) {
        sendSlackNotification({
            text: `[STAGIAIRES] ${stats.deletedMailNotSent} stagiaires pas encore contactés ont été supprimés`,
        });
    }

    return stats;
}, { slack: cli.slack });
