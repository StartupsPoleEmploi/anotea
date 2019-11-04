#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const patchCertifinfos = require('./tasks/refreshCertifInfos');

cli
.option('--file [file]', 'The CSV file with new certifInfos')
.parse(process.argv);

execute(async ({ logger, db, exit }) => {

    let { file } = cli;
    let stats = {};

    if (!file) {
        return exit('Invalid arguments');
    }

    logger.info(`Refreshing certifInfos...`);
    stats.certifInfos = await patchCertifinfos(db, logger, file);

    return stats;

});
