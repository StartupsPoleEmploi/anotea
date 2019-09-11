#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.removeInvalidComments = await require('./tasks/removeInvalidComments')(db);
    return stats;
});
