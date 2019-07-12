#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const patchCertifinfos = require('./tasks/patchCertifInfos');

cli.option('--certifInfos [certifInfos]', 'The CSV file with new certifInfos')
.parse(process.argv);

execute(async ({ logger, db, exit }) => {

    if (!cli.certifInfos) {
        return exit('certifInfos file is required');
    }

    logger.info(`Patching stagiaires...`);
    return patchCertifinfos(db, logger, cli.certifInfos);

}, { slack: cli.slack });
