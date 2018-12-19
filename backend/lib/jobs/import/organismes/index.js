#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const synchronizeOrganismes = require('./synchronizeOrganismes');
const generateOrganismes = require('./generateOrganismes');
const computeScore = require('./computeScore');

cli.description('Import accounts from Intercarif and Kairos')
.option('-i, --import [import]', 'The CSV file to import')
.parse(process.argv);


execute(async ({ logger, db }) => {

    let imported = {};
    if (cli.import) {
        logger.info('Generating organismes data from intercarif and kairos...');
        imported = await generateOrganismes(db, logger, cli.import);
    }

    logger.info('Synchronizing organismes with existing ones...');
    let synchronized = await synchronizeOrganismes(db, logger);

    logger.info('Computing score for all organismes...');
    let computed = await computeScore(db, logger);

    return { imported, synchronized, computed };
});
