#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const generateSessions = require('./generateSessions');
const generateActions = require('./generateActions');

cli.description('Reconciling sessions/actions with comments...')
.parse(process.argv);

execute(async ({ logger, db }) => {

    logger.info(`Generating sessions collection...`);
    await generateSessions(db);

    logger.info(`Generating actions collection...`);
    await generateActions(db);
});
