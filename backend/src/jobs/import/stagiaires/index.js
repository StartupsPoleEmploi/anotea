#!/usr/bin/env node
"use strict";

const cli = require("commander");
const { execute } = require("../../job-utils");
const importTrainee = require("./tasks/importTrainee");
const validateCsvFile = require("./tasks/validateCsvFile");
const refreshTrainee = require("./tasks/refreshTrainee");

cli.description("Import des stagiaires")
.option("--source [name]", "Source to import (PE or IDF)")
.option("--file [file]", "The CSV file to import")
.option("--validate", "Validate CSV file but do not import it")
.option("--refresh", "Refresh stagiaires data from CSV file")
.option("--region [codeRegion]", "Code region to filter")
.option("--financeur [codeFinanceur]", "Code financeur to filter")
.option("--slack", "Send a slack notification when job is finished")
.parse(process.argv);

let sources = {
    "PE": "poleEmploi",
    "IDF": "ileDeFrance",
};

execute(async ({ logger, db, exit, configuration, regions, mailer, sendSlackNotification }) => {

    let { file, source, region, financeur, validate, refresh } = cli;
    let filters = {
        codeRegion: region,
        codeFinanceur: financeur,
    };

    if (!file || !["PE", "IDF"].includes(source)) {
        return exit("Invalid arguments");
    }

    let handler = require(`./tasks/handlers/${sources[source]}CSVHandler`)(db, regions);

    if (validate) {
        logger.info(`Validating file ${file}...`);
        await validateCsvFile(db, logger, file, handler, mailer, configuration);

    } else if (refresh) {
        logger.info(`Refreshing data with ${file}...`);
        return source === "PE" ? refreshTrainee(db, logger, file, handler) : exit("Can only refresh Pôle Emploi CSV file");

    } else {
        logger.info(`Importing source ${source} from file ${file}. Filtering with ${JSON.stringify(filters, null, 2)}...`);
        try {
            let stats = await importTrainee(db, logger, file, handler, filters);

            if (stats.total > 0) {
                sendSlackNotification({
                    text: `[STAGIAIRE] Des nouveaux stagiaires ont été importés : ` +
                        `${stats.imported} importés / ${stats.ignored} ignorés / ${stats.invalid} erreurs)`,
                });
            }

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
