#!/usr/bin/env node
'use strict';

const moment = require('moment');
const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');
const createImporter = require('./traineeImporter');
const validateCSVFile = require('./validateCSVFile');

const sources = {
    'PE': 'poleEmploi',
    'IDF': 'ileDeFrance',
};

/**
 *  Can be launched with the following command
 *  `node jobs/import/trainee [week_number]`
 *
 *  if no [week_number] argument, then use previous week
 **/
const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-trainee-import', configuration);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };
    let dryRun = false;
    cli.description('launch trainee import')
    .option('-d, --dry-run', 'Execute this script in dry mode', () => {
        dryRun = true;
    }, false)
    .option('-s, --source [name]', 'Source to import (PE or IDF)')
    .option('-f, --file [file]', 'The CSV file to import')
    .option('-r, --region [codeRegion]', 'Code region to filter')
    .option('-i, --includeFinancer [codeFinanceur]', 'Financer code to filter')
    .option('-x, --excludeFinancer [codeFinanceur]', 'Financer code to exclude')
    .option('-d, --since [startDate]', 'Import only trainee with a scheduled end date since start date', value => {
        return moment(value, 'DD/MM/YYYY');
    })
    .parse(process.argv);

    let allowedSources = Object.keys(sources);
    if (cli.source === undefined || !allowedSources.includes(cli.source)) {
        return abort(`Source param is required, please choose one : ${JSON.stringify(allowedSources)}`);
    }

    if (!cli.file) {
        return abort('CSV File is required');
    }

    if (cli.region && isNaN(cli.region)) {
        return abort('Region is invalid');
    }

    if (cli.includeFinancer && isNaN(cli.includeFinancer)) {
        return abort('Financer code is invalid');
    }

    if (cli.excludeFinancer && isNaN(cli.excludeFinancer)) {
        return abort('Financer code is invalid');
    }

    if (cli.since && !cli.since.isValid()) {
        return abort('startDate is invalid, please use format \'DD/MM/YYYY\'');
    }

    let importer = createImporter(db, logger, configuration, cli.source);
    let createHandler = require(`./handlers/${sources[cli.source]}CSVHandler`);
    let handler = createHandler(db, logger, configuration);

    try {
        logger.info(`Importing source ${cli.source} from file ${cli.file}...`);
        if (dryRun) {
            logger.info('Dry run');
        }

        if (dryRun === true) {
            let results = await validateCSVFile(cli.file, handler);
        } else {
            let filters = {
                codeRegion: cli.region,
                includeCodeFinancer: cli.includeFinancer,
                excludeCodeFinancer: cli.excludeFinancer,
                startDate: cli.since
            };
            logger.info(`Filtering with `, filters);

            let results = await importer.importTrainee(cli.file, handler, filters);

            let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
            logger.info(`Completed in ${duration}: ${JSON.stringify(results, null, 2)}`);
        }
        await client.close();

    } catch (e) {
        abort(e);
    }
};

main();
