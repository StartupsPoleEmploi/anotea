#!/usr/bin/env node
'use strict';

const path = require('path');
const _ = require('lodash');
const moment = require('moment');
const cli = require('commander');
const colors = require('colors/safe');
const { execute } = require('../../job-utils');
const importTrainee = require('./tasks/importTrainee');
const validateCsvFile = require('./tasks/validateCsvFile');

const sources = {
    'PE': 'poleEmploi',
    'IDF': 'ileDeFrance',
};

cli.description('Import des stagiaires')
.option('--source [name]', 'Source to import (PE or IDF)')
.option('--file [file]', 'The CSV file to import')
.option('--region [codeRegion]', 'Code region to filter')
.option('--since [since]', 'Import only trainee with a scheduled end date since start date', value => moment(`${value} 00Z`))
.option('--append', 'Append stagiaires to an existing campaign')
.option('--slack', 'Send a slack notification when job is finished')
.option('--validate', 'Validate CSV file but do not import it')
.parse(process.argv);

execute(async ({ logger, db, exit, regions, mailer, sendSlackNotification }) => {

    let { file, source, region, since, validate, append } = cli;

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
            source: source
        }, () => ({}), e => exit(e));
    };

    let allowedSources = Object.keys(sources);
    if (source === undefined || !allowedSources.includes(source)) {
        return exit(`Source param is required, please choose one : ${JSON.stringify(allowedSources)}`);
    }

    if (!file) {
        return exit('CSV File is required');
    }

    if (region && isNaN(region)) {
        return exit('Region is invalid');
    }

    if (since && !since.isValid()) {
        return exit('since is invalid, please use format \'YYYY-MM-DD\'');
    }

    let handler = require(`./tasks/handlers/${sources[cli.source]}CSVHandler`)(db, regions);
    let filters = {
        codeRegion: region,
        since: since && since.toDate(),
        append: append,
    };

    if (validate) {
        logger.info(`Validating file ${file}...`);
        let errors = await validateCsvFile(file, handler);
        if (errors) {
            handleValidationError(errors, handler.csvOptions);
        }
    } else {
        logger.info(`Importing source ${source} from file ${file}. Filtering with ${JSON.stringify(filters, null, 2)}...`);
        try {
            let stats = await importTrainee(db, logger, file, handler, filters);

            sendSlackNotification({
                text: `[STAGIAIRE] Le fichier ${file} a été importé : ` +
                    `${stats.imported} importés / ${stats.ignored} ignorés / ${stats.invalid} erreurs)`,
            });

            return stats;
        } catch (stats) {
            sendSlackNotification({
                text: `[STAGIAIRE] Une erreur est survenue lors de l'import du fichier stagiaires ${file} : ` +
                    `${stats.imported} importés / ${stats.ignored} ignorés / ${stats.invalid} erreurs)`
            });
            throw stats;
        }
    }
}, { slack: cli.slack });
