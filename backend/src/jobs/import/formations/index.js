#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const generateFormations = require('./generateFormations');
const generateActions = require('./generateActions');
const generateSessions = require('./generateSessions');

cli.description('Reconciling sessions/actions with comments...')
.parse(process.argv);

execute(async ({ logger, db }) => {

    logger.info(`Reconcile avis with intercarif...`);
    let [formations, actions, sessions] = await Promise.all([
        generateFormations(db),
        generateActions(db),
        generateSessions(db),
    ]);

    return { formations, actions, sessions };
});
