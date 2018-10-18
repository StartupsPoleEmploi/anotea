#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');
const advicesExport = require('./advicesExport');
const organisationsExport = require('./organisationsExport');

/**
 * Can be launched with the following command
 * `node jobs/export/regions`
 */
const main = async () => {

    let devMode = process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'development';
    let client = await getMongoClient(configuration.mongodb.uri);
    let logger = getLogger('anotea-job-region-export', configuration);
    let db = client.db();
    let terminate = async err => {
        if (err) {
            logger.error('An error occurred: ', err);
        }
        await client.close();
    };

    process.on('unhandledRejection', terminate);
    process.on('uncaughtException', terminate);

    cli.description('launch export region').parse(process.argv);

    organisationsExport(db, logger, configuration, devMode, () => {
        advicesExport(db, logger, configuration, devMode, terminate);
    });
};

main();
