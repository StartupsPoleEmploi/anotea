#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.removeUselessHistoryElements = await require('./tasks/removeUselessHistoryElements')(db);
    return stats;
});
