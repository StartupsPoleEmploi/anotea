#!/usr/bin/env node
'use strict';

const cli = require('commander');

const { execute } = require('../job-utils');

execute(async ({ logger, db, configuration }) => {

    cli.description('launch stats export for sms campaign')
    .option('-f, --file [file]', 'The CSV file used for sms campaign')
    .parse(process.argv);
    
    await require('./export-stats')(logger, db, configuration, cli.file);
});
