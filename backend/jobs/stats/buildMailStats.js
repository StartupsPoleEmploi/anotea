#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../components/mongodb');
const getLogger = require('../../components/logger');
const moment = require('moment');

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
        logger.info('Build email statistics displayed on financer dashboard - launch');
        let launchTime = new Date().getTime();
        await mailStatsBuilder.buildStats({ unwind: true });
        await mailStatsBuilder.buildStats({ unwind: false });
        await client.close();
        logger.info(`Build email statistics displayed on financer dashboard - completed (${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
    } catch (e) {
        abort(e);
    }
};

main();
