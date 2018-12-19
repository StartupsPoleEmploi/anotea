#!/usr/bin/env node
'use strict';

const path = require('path');
const _ = require('lodash');
const moment = require('moment');
const cli = require('commander');
const colors = require('colors/safe');
const { execute } = require('../../job-utils');
const createImporter = require('./traineeImporter');
const validateCsvFile = require('./validateCsvFile');

const sources = {
    'PE': 'poleEmploi',
    'IDF': 'ileDeFrance',
};


execute(async ({ logger, db, exit, configuration, mailer }) => {

    const handleValidationError = (validationError, csvOptions) => {
        let { line, type } = validationError;

        if (validationError.type.name === 'BAD_HEADER') {
            logger.error(`File is not valid due to '${validationError.type.name}'. Differences : ` +
                `${colors.red(`${_.difference(csvOptions.columns, line.split(csvOptions.delimiter))}`)}`);
        } else {
            logger.error(`File is not valid due to '${type.name}'.\n${line}`);
        }

        return mailer.sendMalformedImport({
            filename: path.basename(cli.file),
            date: moment().format('DD/MM/YYYY'),
            reason: type.message,
            source: cli.source
        }, () => ({}), e => exit(e));
    };

    let dryRun = false;
    cli.description('launch trainee import')
    .option('-s, --source [name]', 'Source to import (PE or IDF)')
    .option('-f, --file [file]', 'The CSV file to import')
    .option('-r, --region [codeRegion]', 'Code region to filter')
    .option('-s, --since [startDate]', 'Import only trainee with a scheduled end date since start date', value => moment(`${value} 00Z`))
    .option('--append', 'Append stagiaires to an existing campaign')
    .option('-d, --dry-run', 'Execute this script in dry mode', () => {
        dryRun = true;
    }, false)
    .parse(process.argv);

    let allowedSources = Object.keys(sources);
    if (cli.source === undefined || !allowedSources.includes(cli.source)) {
        return exit(`Source param is required, please choose one : ${JSON.stringify(allowedSources)}`);
    }

    if (!cli.file) {
        return exit('CSV File is required');
    }

    if (cli.region && isNaN(cli.region)) {
        return exit('Region is invalid');
    }

    if (cli.since && !cli.since.isValid()) {
        return exit('startDate is invalid, please use format \'YYYY-MM-DD\'');
    }

    let importer = createImporter(db, logger);
    let createHandler = require(`./handlers/${sources[cli.source]}CSVHandler`);
    let handler = createHandler(db, logger, configuration);
    let filters = {
        codeRegion: cli.region,
        startDate: cli.since && cli.since.toDate(),
        append: cli.append,
    };

    if (dryRun === true) {
        logger.info(`Validating file ${cli.file} in dry-run mode...`);
        let validationError = await validateCsvFile(cli.file, handler);
        if (validationError) {
            handleValidationError(validationError, handler.csvOptions);
        }
    } else {
        logger.info(`Importing source ${cli.source} from file ${cli.file}. Filtering with ${JSON.stringify(filters, null, 2)}...`);

        return importer.importTrainee(cli.file, handler, filters);
    }
});
