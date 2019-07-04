#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');
const synchronizeAccountsWithIntercarif = require('./tasks/synchronizeAccountsWithIntercarif');
const synchronizeAccountsWithKairos = require('./tasks/synchronizeAccountsWithKairos');
const computeOrganismesScore = require('./tasks/computeScore');

cli.parse(process.argv);

execute(async ({ logger, db, regions }) => {

    let stats = {};

    logger.info('Synchronizing organismes from Intercarif...');
    stats.intercarif = await synchronizeAccountsWithIntercarif(db, logger, regions);

    logger.info('Synchronizing organismes from Kairos...');
    stats.kairos = await synchronizeAccountsWithKairos(db, logger);

    logger.info('Computing score for all organismes...');
    stats.score = await computeOrganismesScore(db, logger);

    return Promise.resolve(stats);
});
