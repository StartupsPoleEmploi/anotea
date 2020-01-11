#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db, logger }) => {
    let stats = {};
    stats.removedEditedCourriel = await require('./tasks/removedEditedCourriel')(db, logger);
    return stats;
});
