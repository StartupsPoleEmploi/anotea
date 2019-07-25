#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.description('migrate archived collections')
.parse(process.argv);

execute(async ({ db }) => {
    return require('./tasks/dropArchivedCollections')(db);
});
