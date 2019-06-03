#!/usr/bin/env node
'use strict';

const cli = require('commander');

const { execute } = require('../job-utils');

execute(async ({ logger, db, exit, configuration, mailer }) => {

    cli.description('launch trainee export for sms campaign')
    .option('-r, --region [codeRegion]', 'Code region to filter')
    .parse(process.argv);

    if (cli.region && isNaN(cli.region)) {
        return exit('Region is invalid');
    }

    await require('./export-stagiaires')(logger, db, configuration, mailer, cli.region);
});
