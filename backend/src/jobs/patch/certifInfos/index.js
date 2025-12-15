#!/usr/bin/env node
'use strict';

const { program: cli } = require('commander');
const { execute } = require('../../job-utils');
const refreshCertifInfos = require('./tasks/refreshCertifInfos');

cli
.option('--file [file]', 'The CSV file with new certifInfos')
.parse(process.argv);

const { file } = cli.opts();

execute(async ({ logger, db, exit }) => {
    let stats = {};

    if (!file) {
        return exit('Invalid arguments');
    }

    logger.info(`Refreshing certifInfos...`);
    stats.certifInfos = await refreshCertifInfos(db, logger, file);

    return stats;

});
