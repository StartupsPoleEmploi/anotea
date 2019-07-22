#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const patchCertifinfos = require('./tasks/patchCertifInfos');
const refreshDataFromDatalake = require('./tasks/refreshDataFromDatalake');

cli
.option('--certifInfos [certifInfos]', 'The CSV file with new certifInfos')
.option('--datalake [datalake]', 'CSV file from datalake used to refresh data')
.parse(process.argv);

execute(async ({ logger, db, exit }) => {

    if (!cli.certifInfos) {
        return exit('certifInfos file is required');
    }

    let stats = {};

    if (cli.datalake) {
        stats.datalake = await refreshDataFromDatalake(db, logger, cli.datalake);
    }

    logger.info(`Patching stagiaires...`);
    stats.certifInfos = await patchCertifinfos(db, logger, cli.certifInfos);

    return stats;

}, { slack: cli.slack });
