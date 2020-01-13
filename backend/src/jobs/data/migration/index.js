#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.removeCourriels = await require('./tasks/removeCourriels')(db);
    stats.removeUnusedProperties = await require('./tasks/removeUnusedProperties')(db);
    return stats;
});
