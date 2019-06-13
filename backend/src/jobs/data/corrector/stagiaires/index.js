#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../../job-utils');
const correctCertifinfos = require('./tasks/correctCertifinfos');

cli.option('-f, --file [file]', 'The CSV file to import')
.parse(process.argv);

execute(async ({ logger, db, exit }) => {

    if (!cli.file) {
        return exit('file are required');
    }

    logger.info(`Correcting certifinfos...`);
    return correctCertifinfos(db, logger, cli.file);
});
