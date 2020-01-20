#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.dropCollections = await require('./tasks/dropCollections')(db);
    stats.renameCollections = await require('./tasks/renameCollections')(db);
    stats.addJobTypeFlag = await require('./tasks/addJobTypeFlag')(db);
    stats.renameTraineeIntoPersonnal = await require('./tasks/renameTraineeIntoPersonnal')(db);
    stats.cleanSiretProperties = await require('./tasks/cleanSiretProperties')(db);
    stats.renameCourrielIntoIdentifiant = await require('./tasks/renameCourrielIntoIdentifiant')(db);
    stats.renameRaisonSociale = await require('./tasks/renameRaisonSociale')(db);
    stats.renameCommentIntoCommentaires = await require('./tasks/renameCommentIntoCommentaires')(db);
    stats.renameRatesIntoNotes = await require('./tasks/renameRatesIntoNotes')(db);
    stats.unsetStatutRattachement = await require('./tasks/unsetStatutRattachement')(db);
    stats.deprecatedProperties = await require('./tasks/deprecatedProperties')(db);
    return stats;
});
