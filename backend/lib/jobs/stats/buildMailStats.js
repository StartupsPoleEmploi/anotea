#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');

cli.description('Build email statistics displayed on financer dashboard')
.parse(process.argv);

execute(async ({ logger, db, configuration }) => {

    let mailStatsBuilder = require(`./mailStatsBuilder`)(db, logger, configuration);

    logger.info('Build email statistics displayed on financer dashboard - launch');

    await Promise.all([
        mailStatsBuilder.buildStats({ unwind: true }),
        mailStatsBuilder.buildStats({ unwind: false }),
    ]);

    logger.info(`Build email statistics displayed on financer dashboard`);

});
