#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.dropCollections = await require('./tasks/dropCollections')(db);
    stats.cleanSiretProperties = await require('./tasks/cleanSiretProperties')(db);
    stats.renameIdentifiant = await require('./tasks/renameIdentifiant')(db);
    return stats;
});
