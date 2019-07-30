#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.fixAvisCreated = await require('./tasks/fixAvisCreated')(db);
    stats.markOrphanComments = await require('./tasks/markOrphanComments')(db);
    return stats;
});
