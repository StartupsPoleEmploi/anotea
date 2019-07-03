#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const exportCSV = require('./tasks/export');

cli.description('Anonymize training title')
.parse(process.argv);

execute(async ({ db, logger }) => {
    logger.info('Anonymize training title...');
    return exportCSV(db);
});
