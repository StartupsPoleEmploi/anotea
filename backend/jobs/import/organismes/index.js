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
const IntercarifAccountImporter = require('./intercarif/IntercarifAccountImporter');
const KairosAccountImporter = require('./kairos/KairosAccountImporter');

cli.description('Import accounts from Intercarif and Kairos')
.option('-f, --file [file]', 'The CSV file to import')
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
        logger.info('Importing accounts from Intercarif...');
        let intercarifAccountImporter = new IntercarifAccountImporter(db, logger);
        await intercarifAccountImporter.generateOrganismes();
        let intercatif = await intercarifAccountImporter.importAccounts();

        logger.info('Importing accounts from Kairos...');
        let kairosAccountImporter = new KairosAccountImporter(db, logger);
        let kairos = await kairosAccountImporter.importAccounts(cli.file);

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`);
        logger.info(`Results: ${JSON.stringify({ intercatif, kairos }, null, 2)}`);

    } catch (e) {
        abort(e);
    }
};

main();
