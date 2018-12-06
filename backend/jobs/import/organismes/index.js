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

cli.description('Reconciling sessions/actions with comments...')
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
        logger.info(`Generating organismes responsables collection...`);
        await generateOrganismesResponsables(db);

        logger.info(`Generating organismes formateurs collection...`);
        await generateOrganismesFormateurs(db);

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`);

    } catch (e) {
        abort(e);
    }
};

main();
