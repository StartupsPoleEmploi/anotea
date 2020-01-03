#!/usr/bin/env node
"use strict";

const cli = require("commander");
const { execute } = require("../job-utils");
const reconcile = require("./tasks/reconcile");
const addReconciliationAvisMetadata = require("./tasks/addReconciliationAvisMetadata");
const removePreviousImports = require("./tasks/removePreviousImports");

cli.description("Reconciling sessions/actions with comments...")
.parse(process.argv);

execute(async ({ db, logger }) => {

    logger.info(`Reconciling formations, actions and sessions...`);
    let stats = await reconcile(db, logger);

    logger.info(`Running post-process tasks...`);
    await Promise.all([
        addReconciliationAvisMetadata(db),
        removePreviousImports(db),
    ]);

    return stats;
});
