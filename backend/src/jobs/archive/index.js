#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');

cli.description('Adding archived flag to old avis')
.parse(process.argv);

execute(async ({ db, logger }) => {

    logger.info(`Adding flag 'archived' to old avis...`);

    let archiver = require(`./archive`)(db);

    return Promise.all([
        archiver.initArchivedField('comment'),
        archiver.archive('comment'),
    ]);
});
