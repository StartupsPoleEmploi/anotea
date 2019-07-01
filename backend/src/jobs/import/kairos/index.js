#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const importKairosCSV = require('./tasks/importKairosCSV');

cli.description('Import accounts from Intercarif and Kairos')
.option('--file [file]', 'The CSV file with organismes from Kairos')
.parse(process.argv);

execute(async ({ logger, db, exit }) => {

    let file = cli.file;
    if (!file) {
        return exit('file are required');
    }

    logger.info(`Generating organismes from kairos CSV file ${file}...`);
    let stats = await importKairosCSV(db, logger, file);

    return stats.invalid ? Promise.reject(stats) : Promise.resolve(stats);
});
