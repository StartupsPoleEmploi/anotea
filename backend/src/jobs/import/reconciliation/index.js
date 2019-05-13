#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const generateFormations = require('./generateFormations');
const generateActions = require('./generateActions');
const generateSessions = require('./generateSessions');
const addReconciliationAvisMetadata = require('./addReconciliationAvisMetadata');
const removePreviousImports = require('./removePreviousImports');

cli.description('Reconciling sessions/actions with comments...')
.parse(process.argv);

execute(async ({ db, logger }) => {

    logger.info(`Reconciling avis with intercarif...`);
    let [formations, actions, sessions] = await Promise.all([
        generateFormations(db),
        generateActions(db),
        generateSessions(db),
    ]);

    logger.info(`Running post-process tasks...`);
    await Promise.all([
        addReconciliationAvisMetadata(db),
        removePreviousImports(db),
    ]);

    return { formations, actions, sessions };
});
