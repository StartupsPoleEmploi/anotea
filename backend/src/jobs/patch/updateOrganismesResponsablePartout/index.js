#!/usr/bin/env node
'use strict';

const { program: cli } = require('commander');
const { execute } = require('../../job-utils');
const majSiretResponsableDansAvis = require('./tasks/majSiretResponsableDansAvis');

cli
.parse(process.argv);

execute(async ({ logger, db, exit }) => {

    let stats = {};

    logger.info(`RDS majSiretResponsableDansAvis...`);
    stats = await majSiretResponsableDansAvis(db, logger);

    return stats;

});
