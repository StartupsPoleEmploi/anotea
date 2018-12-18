#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const createMongoDBClient = require('../../common/createMongoDBClient');
const createLogger = require('../../common/createLogger');

/**
 *
 *  Can be launched with the following command
 *  `node jobs/archive/archive`
 *
 **/

const main = async () => {

    const client = await createMongoDBClient(configuration.mongodb.uri);
    const db = client.db();
    const logger = createLogger('anotea-job-trainee-advices-archive', configuration);

    cli.description('launch trainees & advices archive')
    .parse(process.argv);

    logger.info(`Archiving old ${cli.source}s from the collection ${cli.source}...`);

    require(`./archive`)(db, logger, configuration).archive('comment', 'archivedAdvices');
    require(`./archive`)(db, logger, configuration).archive('trainee', 'archivedTrainees');

};

main();
