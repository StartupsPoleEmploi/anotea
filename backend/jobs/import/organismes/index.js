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
const generateOrganismesResponsables = require('../organismes/generateOrganismesResponsables');
const generateOrganismesFormateurs = require('../organismes/generateOrganismesFormateurs');

cli.description('Import accounts from Intercarif and Kairos')
.option('-f, --file [file]', 'The CSV file to import')
.parse(process.argv);

const main = async () => {

    let launchTime = new Date().getTime();
    let logger = getLogger('anotea-job-organimes-import', configuration);
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let intercarifAccountImporter = require(`./backend/jobs/import/organismes/importers`)(db, logger, configuration);
    let kairosAccountImporter = require(`./backend/jobs/import/organismes/importers`)(db, logger, configuration);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    try {
        logger.info(`Generating organismes responsables collection...`);
        await generateOrganismesResponsables(db);

        logger.info(`Generating organismes formateurs collection...`);
        await generateOrganismesFormateurs(db);

        logger.info(`Importing accounts from Intercarif...`);
        let intercatif = await intercarifAccountImporter.importAccounts();

        logger.info(`Importing accounts from Kairos...`);
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
