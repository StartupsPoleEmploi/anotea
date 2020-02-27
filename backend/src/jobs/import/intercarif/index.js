#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const importIntercarif = require('./tasks/importIntercarif');

cli.description('Import intercarif and generate all related collections')
.option('-f, --file [file]', 'The file to import')
.option('-x, --unpack', 'Handle file as an archive')
.parse(process.argv);

execute(async ({ logger, db, exit }) => {

    let { file, unpack } = cli;

    if (!file) {
        return exit('file are required');
    }

    logger.info(`Generating intercarif collection...`);
    return importIntercarif(db, logger, file, { unpack });
});
