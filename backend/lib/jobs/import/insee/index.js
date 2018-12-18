#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const createMongoDBClient = require('../../../common/createMongoDBClient');
const createLogger = require('../../../common/createLogger');


cli.description('Import Postal Code <-> City Code INSEE mapping from CSV file')
.option('-f, --file [file]', 'The CSV file to import')
.parse(process.argv);


const main = async () => {
    let client = await createMongoDBClient(configuration.mongodb.uri);
    let logger = createLogger('anotea-job-import-insee', configuration);
    let db = client.db();
    let romeImporter = require(`./importer`)(db, logger, configuration);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    if (!cli.file) {
        return abort('invalid arguments');
    }

    try {
        romeImporter.doImport(cli.file);
    } catch (e) {
        abort(e);
    }
};

main();
