#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../components/mongodb');
const getLogger = require('../../components/logger');


cli.description('Build email statistics displayed on financer dashboard')
.parse(process.argv);


const main = async () => {
    let client = await getMongoClient(configuration.mongodb.uri);
    let logger = getLogger('anotea-job-stats-mail', configuration);
    let db = client.db();
    let mailStatsBuilder = require(`./mailStatsBuilder`)(db, logger, configuration);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    try {
        await mailStatsBuilder.buildStats();
        await client.close();
    } catch (e) {
        abort(e);
    }
};

main();
