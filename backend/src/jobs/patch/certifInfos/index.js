#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const patchCertifinfos = require('./tasks/refreshCertifInfos');

cli
.option('--file [file]', 'The CSV file with new certifInfos')
.parse(process.argv);

execute(async ({ logger, db }) => {

    let stats = {};

    if (cli.file) {
        logger.info(`Refreshing certifInfos...`);
        stats.certifInfos = await patchCertifinfos(db, logger, cli.file);
    }

    return stats;

});
