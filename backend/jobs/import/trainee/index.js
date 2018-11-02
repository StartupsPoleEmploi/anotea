#!/usr/bin/env node
'use strict';

const moment = require('moment');
const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');
const createImporter = require('./traineeImporter');

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
    .option('-c, --financer [codeFinanceur]', 'Financer code to filter')
    .option('-d, --since [startDate]', 'Import only trainee with a scheduled end date since start date')
    .parse(process.argv);

    let allowedSources = Object.keys(sources);
    if (cli.source === undefined || !allowedSources.includes(cli.source)) {
        return abort(`Source param is required, please choose one : ${JSON.stringify(allowedSources)}`);
    }

    if (!cli.file) {
        return abort('CSV File is required');
    }

    let importer = createImporter(db, logger, configuration, cli.source);
    let createBuilder = require(`./handlers/${sources[cli.source]}CSVHandler`);
    let builder = createBuilder(db, logger, configuration);

    try {
        logger.info(`Importing source ${cli.source} from file ${cli.file}...`);
        if (dryRun) {
            logger.info('Dry run');
        }
        let codeRegion = null;
        if (cli.region) {
            if (!isNaN(cli.region)) {
                codeRegion = cli.region;
                logger.info(`Filtering on region number '${codeRegion}'`);
            } else {
                abort('Region number is invalid');
            }
        }
        let codeFinancer = null;
        if (cli.financer) {
            if (!isNaN(cli.financer)) {
                codeFinancer = cli.financer;
                logger.info(`Filtering on financer code '${codeFinancer}'`);
            } else {
                abort('Financer code is invalid');
            }
        }

        let startDate = null;
        if (cli.since) {
            startDate = moment(cli.since, 'DD/MM/YYYY');
            if (startDate.isValid()) {
                logger.info(`Filtering on scheduled end date since '${startDate}'`);
            } else {
                abort('startDate is invalid, please use format \'DD/MM/YYYY\'');
            }
        }
        let results = await importer.importTrainee(cli.file, builder, dryRun, codeRegion, codeFinancer, startDate);
        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}: ${JSON.stringify(results, null, 2)}`);

    } catch (e) {
        abort(e);
    }
};

main();
