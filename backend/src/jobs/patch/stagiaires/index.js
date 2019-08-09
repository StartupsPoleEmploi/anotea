#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const patchCertifinfos = require('./tasks/refreshCertifInfos');
const refreshDataFromDatalake = require('./tasks/refreshDataFromDatalake');

cli
.option('--certifInfos [certifInfos]', 'The CSV file with new certifInfos')
.option('--datalake [datalake]', 'CSV file from datalake used to refresh data')
.parse(process.argv);

execute(async ({ logger, db }) => {

    let stats = {};

    if (cli.datalake) {
        logger.info(`Refreshing stagiaires and avis with datalake file...`);
        stats.datalake = await refreshDataFromDatalake(db, logger, cli.datalake);
    }

    if (cli.certifInfos) {
        logger.info(`Refreshing certifInfos...`);
        stats.certifInfos = await patchCertifinfos(db, logger, cli.certifInfos);
    }

    return stats;

});
