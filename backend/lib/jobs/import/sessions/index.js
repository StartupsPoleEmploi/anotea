#!/usr/bin/env node
'use strict';

/*
 Can be launched with the following command
    `node jobs/import/intercarif /path/to/lheo_offre_info_complet.xml`
 */
const cli = require('commander');
const moment = require('moment');
const configuration = require('config');
const createMongoDBClient = require('../../../common/createMongoDBClient');
const createLogger = require('../../../common/createLogger');
const generateSessions = require('./generateSessions');
const generateActions = require('./generateActions');

cli.description('Reconciling sessions/actions with comments...')
.parse(process.argv);

const main = async () => {

    let launchTime = new Date().getTime();
    let logger = createLogger('anotea-job-sessions-import', configuration);
    let client = await createMongoDBClient(configuration.mongodb.uri);
    let db = client.db();

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    try {
        logger.info(`Generating sessions collection...`);
        await generateSessions(db);

        logger.info(`Generating actions collection...`);
        await generateActions(db);

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`);

    } catch (e) {
        abort(e);
    }
};

main();
