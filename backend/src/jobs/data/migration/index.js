#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.description('migrate archived collections')
.parse(process.argv);

execute(async ({ db, logger, configuration }) => {

    logger.info(`adding flag to old avis then migrating archived collections...`);

    let migrater = require(`./tasks/migrateArchivedCollections`)(db, logger, configuration);

    return migrater.migrateArchivedCollections();
});
