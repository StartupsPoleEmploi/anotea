#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');

/**
 *  Can be launched with the following command
 *  `node jobs/export/advices`
 *
 **/
const main = async () => {

    const client = await getMongoClient(configuration.mongodb.uri);
    const db = client.db();
    const logger = getLogger('anotea-job-advices-export', configuration);

    const TARGET = ['DM', 'LBF'];

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    cli.description('launch advices export')
    .option('-t, --target [name]', 'Target to export (DM or LBF)')
    .parse(process.argv);

    if (cli.target === undefined) {
        return abort('Target param is required');
    }
    if (!TARGET.includes(cli.target)) {
        return abort('Target param is not known, please choose one : ', JSON.stringify(TARGET));
    }

    logger.info(`Exporting target ${cli.target}...`);

    require(`./findIncomingTrainings`)(db, logger, configuration, () => {
        require(`./export${cli.target}`)(db, logger, configuration, () => {
            client.close();
        });
    });
};

main();
