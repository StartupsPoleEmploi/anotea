#!/usr/bin/env node
'use strict';

/*
 Can be launched with the following command
    `node jobs/import/intercarif /path/to/lheo_offre_info_complet.xml`
 */
const cli = require('commander');
const moment = require('moment');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');
const AccountImporter = require('./AccountImporter');

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
        logger.info('Importing accounts from Intercarif...');
        let accountImporter = new AccountImporter(db, logger);
        let generated = {};

        if (cli.generate) {
            generated.kairos = await accountImporter.generateOrganismes(cli.file);
        }

        let imported = await accountImporter.importAccounts();

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`);
        logger.info(`Results: ${JSON.stringify({ generated, imported }, null, 2)}`);

    } catch (e) {
        abort(e);
    }
};

main();
