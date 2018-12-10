#!/usr/bin/env node
'use strict';

const cli = require('commander');
const moment = require('moment');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');
const importAccounts = require('./importAccounts');
const generateOrganismes = require('./generateOrganismes');
const computeScore = require('./computeScore');

cli.description('Import accounts from Intercarif and Kairos')
.option('-f, --file [file]', 'The CSV file to import')
.option('-g, --generate', 'Generate all collections')
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

    if (cli.generate && !cli.file) {
        return abort('Kairos CSV File is required to generate kairos collection');
    }

    try {
        let organismes = {};
        if (cli.generate) {
            logger.info('Generating organismes collections...');
            organismes = await generateOrganismes(db, logger, cli.file);
        }

        logger.info('Importing accounts...');
        let accounts = await importAccounts(db, logger);

        logger.info('Computing score...');
        await computeScore(db, logger);

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`);
        logger.info(`Results: ${JSON.stringify({ organismes, accounts }, null, 2)}`);

    } catch (e) {
        abort(e);
    }
};

main();
