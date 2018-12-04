#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');


cli.description('Import Postal Code <-> City Code INSEE mapping from CSV file')
.option('-f, --file [file]', 'The CSV file to import')
.parse(process.argv);


const main = async () => {
    let client = await getMongoClient(configuration.mongodb.uri);
    let logger = getLogger('anotea-job-import-insee', configuration);
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
