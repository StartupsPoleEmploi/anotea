#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    await require('./tasks/fixAvisCreated')(db);
    return require('./tasks/markOrphanComments')(db);
});
