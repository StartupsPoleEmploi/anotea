#!/usr/bin/env node
'use strict';

const moment = require('moment');
const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');


cli.description('Import accounts from Intercarif and Kairos')
.option('-f, --file [file]', 'The CSV file to import')
.parse(process.argv);


const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let logger = getLogger('anotea-job-kairos-import', configuration);
    let db = client.db();
    let intercarifAccountImporter = require(`./importers/intercarifAccountImporter`)(db, logger, configuration);
    let kairosAccountImporter = require(`./importers/kairosAccountImporter`)(db, logger, configuration);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    if (!cli.file) {
        return abort('invalid arguments');
    }

    try {
        logger.info(`Importing accounts from Intercarif...`);
        let intercatif = await intercarifAccountImporter.importAccounts();

        logger.info(`Importing accounts from Kairos...`);
        let kairos = await kairosAccountImporter.importAccounts(cli.file);

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration})`);
        logger.info(`Intercarif: ${JSON.stringify(intercatif, null, 2)}`);
        logger.info(`Kairos: ${JSON.stringify(kairos, null, 2)}`);

    } catch (e) {
        abort(e);
    }
};

main();
