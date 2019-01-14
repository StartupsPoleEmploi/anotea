#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Build email statistics displayed on financer dashboard')
.parse(process.argv);

execute(async ({ logger, db, configuration }) => {

    logger.info('Building email statistics displayed on financer dashboard');

    let emailStatsBuilder = require('./emailStatsBuilder')(db, logger, configuration);
    await Promise.all([
        emailStatsBuilder.buildStats({ unwind: true }),
        emailStatsBuilder.buildStats({ unwind: false }),
    ]);
});
