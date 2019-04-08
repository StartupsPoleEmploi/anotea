#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');

cli.description('launch advices archive')
.parse(process.argv);

execute(async ({ db, logger, configuration }) => {

    logger.info(`Archiving old advices...`);

    let archiver = require(`./archive`)(db, logger, configuration);

    let log = result => logger.info(`Old ${result.sourceCollection}s archiving - completed (${result.count} ${result.sourceCollection}s)`);

    return new Promise(async (resolve, reject) => {
        log(await archiver.archive('comment', 'archivedAdvices'));
        resolve();
    });
    
});
