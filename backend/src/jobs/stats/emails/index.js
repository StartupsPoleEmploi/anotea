#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');

cli.description('Build email statistics')
.parse(process.argv);

execute(async ({ logger, db, configuration }) => {

    logger.info('Building email statistics');

    let emailStatsBuilder = require('./emailStatsBuilder')(db, logger, configuration);
    let domaineMailStats = require('./domainMailStatsBuilder')(db, logger, configuration);
    await Promise.all([
        emailStatsBuilder.buildStats({ unwind: true }),
        emailStatsBuilder.buildStats({ unwind: false }),
        domaineMailStats.buildStats()
    ]);
});
