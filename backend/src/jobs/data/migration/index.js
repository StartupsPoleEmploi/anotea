#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.description('migrate archived collections')
.option('-s, --source [collection]', 'The collection to migrate')
.option('-d, --destination [collection]', 'The collection to migrate to')
.parse(process.argv);

execute(async ({ db, logger, exit, configuration }) => {
    let migrater = require(`./tasks/migrateArchivedCollections`)(db, logger, configuration);

    if (!cli.source || !cli.destination) {
        return exit('invalid arguments');
    }

    return migrater.migrateArchivedCollections(cli.source, cli.destination);
});
