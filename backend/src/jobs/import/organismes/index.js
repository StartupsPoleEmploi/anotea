#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const generateOrganismesFromIntercarif = require('./generateOrganismesFromIntercarif');
const generateOrganismesFromKairos = require('./generateOrganismesFromKairos');
const synchronizeOrganismesWithAccounts = require('./synchronizeOrganismesWithAccounts');
const computeOrganismesScore = require('./computeOrganismesScore');

cli.description('Import accounts from Intercarif and Kairos')
.option('-i, --import [import]', 'The CSV file to import')
.parse(process.argv);


execute(async ({ logger, db }) => {

    let imported = {};
    logger.info('Generating organismes data from intercarif...');
    imported.intercarif = await generateOrganismesFromIntercarif(db, logger);

    if (cli.import) {
        logger.info('Generating organismes data from kairos...');
        imported.kairos = await generateOrganismesFromKairos(db, logger, cli.import);
    }

    logger.info('Synchronizing organismes with existing ones...');
    let synchronized = await synchronizeOrganismesWithAccounts(db, logger);

    logger.info('Computing score for all organismes...');
    let computed = await computeOrganismesScore(db, logger);

    return { imported, synchronized, computed };
});
