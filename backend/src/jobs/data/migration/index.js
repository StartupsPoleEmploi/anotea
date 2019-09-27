#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.dropInseeCodeCollection = await require('./tasks/dropInseeCodeCollection')(db);
    stats.removeEvents = await require('./tasks/removeEvents')(db);
    return stats;
});
