#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const unpackGzFile = require('./utils/unpackGzFile');
const importIntercarif = require('./importIntercarif');

let unpack = false;
cli.description('Import intercarif and generate all related collections')
.option('-f, --file [file]', 'The file to import')
.option('-x, --unpack', 'Handle file as an archive', () => {
    unpack = true;
})
.parse(process.argv);

execute(async ({ logger, db, exit }) => {

    if (!cli.file) {
        return exit('file are required');
    }

    let xmlFile = cli.file;
    if (unpack) {
        logger.info(`Decompressing ${cli.file}...`);
        xmlFile = await unpackGzFile(cli.file);
    }

    logger.info(`Generating intercarif collection...`);
    return importIntercarif(db, logger, xmlFile);
});
