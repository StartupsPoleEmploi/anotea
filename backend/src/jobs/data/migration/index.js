#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db, logger }) => {
    let stats = {};
    stats.removeEvents = await require('./tasks/removeEvents')(db);
    stats.addModerationStatusProperties = await require('./tasks/addModerationStatusProperties')(db);
    stats.addReadProperty = await require('./tasks/addReadProperty')(db);
    stats.removeAnsweredProperty = await require('./tasks/removeAnsweredProperty')(db);
    stats.removeEmptyCommentaires = await require('./tasks/removeEmptyCommentaires')(db);
    stats.removeModerationStatusForNotes = await require('./tasks/removeModerationStatusForNotes')(db);
    stats.removeDuplicatedStagiaires = await require('./tasks/removeDuplicatedStagiaires')(db, logger);
    stats.removeStagiairesUnusedProperties = await require('./tasks/removeStagiairesUnusedProperties')(db);
    stats.addLastStatusUpdatePropertyIntoReponse = await require('./tasks/addLastStatusUpdatePropertyIntoReponse')(db);
    stats.fixCodeFinanceurs = await require('./tasks/fixCodeFinanceurs')(db);
    stats.removeUselessMetaReconciliations = await require('./tasks/removeUselessMetaReconciliations')(db);
    stats.removeFeaturesPropertyInAccounts = await require('./tasks/removeFeaturesPropertyInAccounts')(db);
    stats.moveTitleMaskedProperty = await require('./tasks/moveTitleMaskedProperty')(db);
    return stats;
});
