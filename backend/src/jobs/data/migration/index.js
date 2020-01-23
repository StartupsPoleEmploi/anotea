#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db, logger }) => {

    let migrate = async scriptName => {
        logger.info(`Running script ${scriptName}...`);
        return {
            [scriptName]: await require(`./tasks/${scriptName}`)(db),
        };
    };

    return {
        ...(await migrate('dropCollections')),
        ...(await migrate('renameCollections')),
        ...(await migrate('addJobTypeFlag')),
        ...(await migrate('renameTraineeIntoIndividu')),
        ...(await migrate('cleanSiretProperties')),
        ...(await migrate('renameCourrielIntoIdentifiant')),
        ...(await migrate('renameRaisonSociale')),
        ...(await migrate('renameCommentIntoCommentaires')),
        ...(await migrate('renameRatesIntoNotes')),
        ...(await migrate('unsetStatutRattachement')),
        ...(await migrate('deprecatedProperties')),
        ...(await migrate('renameTrainingIntoFormation')),
        ...(await migrate('addRefreshKey')),
    };
});
