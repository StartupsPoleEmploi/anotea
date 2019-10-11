#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db, logger }) => {
    let stats = {};
    stats.addMissingModerationStatus = await require('./tasks/addMissingModerationStatus')(db);
    stats.addReadProperty = await require('./tasks/addReadProperty')(db);
    stats.removeAnsweredProperty = await require('./tasks/removeAnsweredProperty')(db);
    stats.removeEmptyCommentaires = await require('./tasks/removeEmptyCommentaires')(db);
    stats.removeModerationStatusForNotes = await require('./tasks/removeModerationStatusForNotes')(db);
    stats.removeDuplicatedStagiaires = await require('./tasks/removeDuplicatedStagiaires')(db, logger);
    stats.addLastStatusUpdateIntoReponse = await require('./tasks/addLastStatusUpdateIntoReponse')(db);
    stats.fixCodeFinanceurs = await require('./tasks/fixCodeFinanceurs')(db);
    stats.removeUselessMetaReconciliations = await require('./tasks/removeUselessMetaReconciliations')(db);
    stats.removeFeaturesPropertyInAccounts = await require('./tasks/removeFeaturesPropertyInAccounts')(db);
    stats.moveTitleMaskedProperty = await require('./tasks/moveTitleMasked')(db);
    stats.moveEditedCommentProperty = await require('./tasks/moveEditedComment')(db);
    stats.pushResfreshedPropertyIntoHistory = await require('./tasks/pushMetaResfreshedIntoHistory')(db);
    stats.moveTrackingIntoStagiaires = await require('./tasks/moveTrackingIntoStagiaires')(db);
    stats.removeEvents = await require('./tasks/removeEvents')(db);
    stats.removeUnusedProperties = await require('./tasks/removeUnusedProperties')(db);
    stats.renameRejectReason = await require('./tasks/renameRejectReason')(db);
    stats.convertModerationStatus = await require('./tasks/convertModerationStatus')(db);
    return stats;
});
