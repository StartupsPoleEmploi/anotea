#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');

cli.description('launch trainees & advices archive')
.parse(process.argv);

execute(async ({ db, logger, configuration }) => {

    logger.info(`Archiving old ${cli.source}s from the collection ${cli.source}...`);

    let archiver = require(`./archive`)(db, logger, configuration);

    archiver.archive('comment', 'archivedAdvices');
    archiver.archive('trainee', 'archivedTrainees');
});
