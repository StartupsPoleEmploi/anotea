#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');
const synchronizeAccounts = require('./tasks/synchronizeAccounts');
const addMissingAccountFromKairos = require('./tasks/addMissingAccountFromKairos');
const computeOrganismesScore = require('./tasks/computeScore');

cli.parse(process.argv);

execute(async ({ logger, db, regions }) => {

    let stats = {};

    logger.info('Synchronizing organismes...');
    stats.synchronized = await synchronizeAccounts(db, logger, regions);

    logger.info('Add missing accounts from Kairos...');
    stats.kairos = await addMissingAccountFromKairos(db, logger);

    logger.info('Computing score for all organismes...');
    stats.computed = await computeOrganismesScore(db, logger);

    return Promise.resolve(stats);
});
