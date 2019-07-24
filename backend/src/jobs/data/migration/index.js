#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.description('migrate archived collections')
.parse(process.argv);

execute(async ({ db, logger }) => {

    logger.info(`adding flag to old avis then migrating archived collections...`);

    await require('./tasks/initArchivedField')(db);

    let migrater = require(`./tasks/migrateArchivedCollections`)(db, logger);
    let stats = await migrater.migrateArchivedCollections();

    await require('./tasks/dropArchivedCollections')(db);

    return stats;
});
