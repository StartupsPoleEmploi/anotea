#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const generateOrganismesFromIntercarif = require('./tasks/generateOrganismesFromIntercarif');
const synchronizeOrganismesWithAccounts = require('./tasks/synchronizeOrganismesWithAccounts');
const computeOrganismesScore = require('./tasks/computeScore');

cli.description('Import accounts from Intercarif and Kairos')
.parse(process.argv);

execute(async ({ logger, db, regions }) => {

    let hasErrors = false;
    logger.info('Generating organismes data from intercarif...');
    let imported = {};
    imported.intercarif = await generateOrganismesFromIntercarif(db, logger);

    logger.info('Synchronizing organismes with existing ones...');
    let synchronized = {};
    try {
        synchronized = await synchronizeOrganismesWithAccounts(db, logger, regions);
    } catch (e) {
        hasErrors = true;
        synchronized = e;
    }

    logger.info('Computing score for all organismes...');
    let computed = await computeOrganismesScore(db, logger);

    let results = { imported, synchronized, computed, hasErrors };
    return hasErrors ? Promise.reject(results) : Promise.resolve(results);
});
