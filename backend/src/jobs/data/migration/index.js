#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.removeEvents = await require('./tasks/removeEvents')(db);
    stats.addModerationStatusProperties = await require('./tasks/addModerationStatusProperties')(db);
    stats.addReadProperty = await require('./tasks/addReadProperty')(db);
    stats.removeAnsweredProperty = await require('./tasks/removeAnsweredProperty')(db);
    stats.removeEmptyCommentaires = await require('./tasks/removeEmptyCommentaires')(db);
    stats.removeModerationStatusForNotes = await require('./tasks/removeModerationStatusForNotes')(db);
    stats.removeStagiairesUnusedProperties = await require('./tasks/removeStagiairesUnusedProperties')(db);
    stats.addLastStatusUpdatePropertyIntoReponse = await require('./tasks/addLastStatusUpdatePropertyIntoReponse')(db);
    return stats;
});
