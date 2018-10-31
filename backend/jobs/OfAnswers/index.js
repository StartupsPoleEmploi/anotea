#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../components/mongodb');
const getLogger = require('../../components/logger');

/**
 *
 *  Can be launched with the following command
 *  `node jobs/OfAnswers/index`
 *
 **/

const main = async () => {

    const client = await getMongoClient(configuration.mongodb.uri);
    const db = client.db();
    const logger = getLogger('anotea-job-of-answers', configuration);

    cli.description('launch...')
    .parse(process.argv);

    require(`./OfAnswers`)(db, logger, configuration).archive('comment');

};

main();
