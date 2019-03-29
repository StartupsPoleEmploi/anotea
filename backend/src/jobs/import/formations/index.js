#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const generateFormations = require('./generateFormations');
const generateActions = require('./generateActions');
const generateSessions = require('./generateSessions');

cli.description('Reconciling sessions/actions with comments...')
.parse(process.argv);

execute(async ({ logger, db, regions }) => {

    logger.info(`Generating formations collections...`);
    let [formations, actions, sessions] = await Promise.all([
        generateFormations(db, regions),
        generateActions(db, regions),
        generateSessions(db, regions),
    ]);

    return { formations, actions, sessions };
});
