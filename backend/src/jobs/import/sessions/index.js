#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const generateSessions = require('./generateSessions');
const generateActions = require('./generateActions');

cli.description('Reconciling sessions/actions with comments...')
.parse(process.argv);

execute(async ({ logger, db, regions }) => {

    logger.info(`Generating formations collections...`);
    let [sessions, actions] = await Promise.all([
        generateSessions(db, regions),
        generateActions(db, regions)
    ]);

    return { sessions, actions };
});
