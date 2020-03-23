#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const importStagiaire = require('./tasks/importStagiaires');
const refreshStagiaires = require('./tasks/refreshStagiaires');

cli.description('Import des stagiaires')
.option('--source [name]', 'Source to import (PE or IDF)')
.option('--file [file]', 'The CSV file to import')
.option('--refresh', 'Refresh stagiaires instead of importing them')
.option('--region [codeRegion]', 'Code region to filter')
.option('--financeur [codeFinanceur]', 'Code financeur to filter')
.option('--unpack', 'Handle file as an archive')
.option('--slack', 'Send a slack notification when job is finished')
.parse(process.argv);

let sources = {
    'PE': 'poleEmploi',
    'IDF': 'ileDeFrance',
};

execute(async ({ logger, db, exit, regions, sendSlackNotification }) => {

    let { file, source, region, financeur, unpack, refresh } = cli;
    let filters = {
        codeRegion: region,
        codeFinanceur: financeur,
    };

    if (!file || !['PE', 'IDF'].includes(source)) {
        return exit('Invalid arguments');
    }

    let handler = require(`./tasks/handlers/${sources[source]}CSVHandler`)(db, regions);

    logger.info(`Importing source ${source} from file ${file}. Filtering with ${JSON.stringify(filters, null, 2)}...`);
    try {
        let stats = refresh ?
            await refreshStagiaires(db, logger, file, handler, filters, { unpack }) :
            await importStagiaire(db, logger, file, handler, filters, { unpack });

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
}, { slack: cli.slack });
