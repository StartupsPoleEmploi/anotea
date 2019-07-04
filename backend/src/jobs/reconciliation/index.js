#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');
const reconcile = require('./tasks/reconcile');
const addReconciliationAvisMetadata = require('./tasks/addReconciliationAvisMetadata');
const removePreviousImports = require('./tasks/removePreviousImports');
const createReporter = require('./tasks/utils/createReporter');

cli.description('Reconciling sessions/actions with comments...')
.option('--reporting [reporting]', 'The directory where reporting files will be saved')
.parse(process.argv);

execute(async ({ db, logger }) => {

    let reporter = cli.reporting ? createReporter(cli.reporting) : null;

    logger.info(`Reconciling formations, actions and sessions...`);
    let stats = await reconcile(db, logger, { formations: true, actions: true, sessions: true, reporter });

    logger.info(`Running post-process tasks...`);
    await Promise.all([
        addReconciliationAvisMetadata(db),
        removePreviousImports(db),
    ]);

    if (reporter) {
        reporter.end();
    }

    return stats;
});
