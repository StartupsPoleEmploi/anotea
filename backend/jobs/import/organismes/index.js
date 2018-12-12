#!/usr/bin/env node
'use strict';

const cli = require('commander');
const moment = require('moment');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');
const synchronizeOrganismes = require('./synchronizeOrganismes');
const generateOrganismes = require('./generateOrganismes');
const computeScore = require('./computeScore');

cli.description('Import accounts from Intercarif and Kairos')
.option('-i, --import [import]', 'The CSV file to import')
.parse(process.argv);

const main = async () => {

    let launchTime = new Date().getTime();
    let logger = getLogger('anotea-job-organimes-import', configuration);
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    try {
        let imported = {};
        if (cli.import) {
            logger.info('Generating organismes data from intercarif and kairos...');
            imported = await generateOrganismes(db, logger, cli.import);
        }

        logger.info('Synchronizing organismes with existing ones...');
        let synchronized = await synchronizeOrganismes(db, logger);

        logger.info('Computing score for all organismes...');
        let computed = await computeScore(db, logger);

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`);
        logger.info(`Results: ${JSON.stringify({ imported, synchronized, computed }, null, 2)}`);

    } catch (e) {
        abort(e);
    }
};

main();
