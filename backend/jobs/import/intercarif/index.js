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
const unpackGzFile = require('./utils/unpackGzFile');
const importIntercarif = require('./importIntercarif');

let unpack = false;
cli.description('Import intercarif and generate all related collections')
.option('-f, --file [file]', 'The file to import')
.option('-x, --unpack', 'Handle file as an archive', () => {
    unpack = true;
})
.parse(process.argv);

const main = async () => {

    let launchTime = new Date().getTime();
    let logger = getLogger('anotea-job-intercarif-import', configuration);
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    try {
        if (!cli.file) {
            return abort('file are required');
        }

        let xmlFile = cli.file;
        if (unpack) {
            logger.info(`Decompressing ${cli.file}...`);
            xmlFile = await unpackGzFile(cli.file);
        }

        logger.info(`Generating intercarif collection...`);
        await importIntercarif(db, logger, xmlFile);

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`);

    } catch (e) {
        abort(e);
    }
};

main();
