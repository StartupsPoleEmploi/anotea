#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../../job-utils');

cli.description('Build training session statistics displayed on financer dashboard')
.parse(process.argv);

execute(async ({ logger, db, configuration }) => {

    logger.info('Building training session statistics displayed on financer dashboard');

    let sessionStatsBuilder = require('./sessionStatsBuilder')(db, logger, configuration);
    await sessionStatsBuilder.buildStats({ unwind: true });
    await sessionStatsBuilder.buildStats({ unwind: false });
});
