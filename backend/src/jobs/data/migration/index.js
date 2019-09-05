#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db, regions }) => {
    let stats = {};
    stats.unsetRefreshedStatus = await require('./tasks/unsetRefreshedStatus')(db);
    stats.removeInvalidStagiares = await require('./tasks/removeInvalidStagiares')(db, regions);
    return stats;
});
