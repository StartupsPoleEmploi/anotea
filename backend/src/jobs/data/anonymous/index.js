#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const exportCSV = require('./tasks/export');
const doAnonymization = require('./tasks/doAnonymization');

cli.description('Anonymize training title')
.option('--export', 'Export result')
.option('--apply', 'Apply anonymization to database')
.parse(process.argv);

execute(async ({ db, logger, exit }) => {

    if (cli.export) {
        logger.info('Export anonymized training title...');
        return exportCSV(db);
    } else if (cli.apply) {
        logger.info('Anonymize training title...');
        return doAnonymization(db);
    } else {
        return exit('Invalid arguments');
    }

});
