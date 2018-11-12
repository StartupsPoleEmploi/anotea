#!/usr/bin/env node
'use strict';

const path = require('path');
const _ = require('lodash');
const moment = require('moment');
const cli = require('commander');
const colors = require('colors/safe');
const configuration = require('config');
const getMongoClient = require('../../../components/mongodb');
const getLogger = require('../../../components/logger');
const createImporter = require('./traineeImporter');
const validateCsvFile = require('./validateCsvFile');
const createMailer = require('../../../components/mailer');

const sources = {
    'PE': 'poleEmploi',
    'IDF': 'ileDeFrance',
};

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-trainee-import', configuration);
    let mailer = createMailer(db, logger, configuration);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    const handleValidationError = (validationError, csvOptions) => {
        let { line, type, message } = validationError;

        if (validationError.type === 'BAD_HEADER') {
            logger.error(`File is not valid due to '${validationError.type}'. Differences : ` +
                `${colors.red(`${_.difference(csvOptions.columns, line.split(csvOptions.delimiter))}`)}`);
        } else {
            logger.error(`File is not valid due to '${type.toString()}'.\n${line}`);
        }

        return mailer.sendMalformedImport({
            filename: path.basename(cli.file),
            date: moment().format('DD/MM/YYYY'),
            reason: message,
            source: cli.source
        }, () => ({}), e => abort(e));
    };

    let dryRun = false;
    cli.description('launch trainee import')
    .option('-s, --source [name]', 'Source to import (PE or IDF)')
    .option('-f, --file [file]', 'The CSV file to import')
    .option('-r, --region [codeRegion]', 'Code region to filter')
    .option('-i, --includeCodeFinanceur [codeFinanceur]', 'Financer code to filter')
    .option('-x, --excludeCodeFinancer [codeFinanceur]', 'Financer code to exclude')
    .option('-s, --since [startDate]', 'Import only trainee with a scheduled end date since start date',
        value => moment(value, 'DD/MM/YYYY'))
    .option('-d, --dry-run', 'Execute this script in dry mode', () => {
        dryRun = true;
    }, false)
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

    if (cli.includeCodeFinanceur && isNaN(cli.includeCodeFinanceur)) {
        return abort('Financer code is invalid');
    }

    if (cli.excludeCodeFinancer && isNaN(cli.excludeCodeFinancer)) {
        return abort('Financer code is invalid');
    }

    if (cli.since && !cli.since.isValid()) {
        return abort('startDate is invalid, please use format \'DD/MM/YYYY\'');
    }

    let importer = createImporter(db, logger);
    let createHandler = require(`./handlers/${sources[cli.source]}CSVHandler`);
    let handler = createHandler(db, logger, configuration);
    let filters = {
        codeRegion: cli.region,
        startDate: cli.since,
        includeCodeFinancer: cli.includeCodeFinanceur,
        excludeCodeFinancer: cli.excludeCodeFinancer,
    };

    try {

        if (dryRun === true) {
            logger.info(`Validating file ${cli.file} in dry-run mode...`);
            let validationError = await validateCsvFile(cli.file, handler);
            if (validationError) {
                handleValidationError(validationError, handler.csvOptions);
            }
        } else {
            logger.info(`Importing source ${cli.source} from file ${cli.file}. Filtering with ${JSON.stringify(filters, null, 2)}...`);

            let results = await importer.importTrainee(cli.file, handler);

            let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
            logger.info(`Completed in ${duration}: ${JSON.stringify(results, null, 2)}`);
        }

        await client.close();

    } catch (e) {
        abort(e);
    }
};

main();
