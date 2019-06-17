#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../../job-utils');

cli.description('Build organisation statistics displayed on financer dashboard')
.parse(process.argv);

execute(async ({ logger, db, configuration }) => {

    logger.info('Building organisation statistics displayed on financer dashboard');

    let sessionStatsBuilder = require('./organisationStatsBuilder')(db, logger, configuration);
    await sessionStatsBuilder.buildStats();
});
