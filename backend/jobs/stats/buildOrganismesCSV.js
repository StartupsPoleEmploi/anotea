#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { encodeStream } = require('iconv-lite');
const path = require('path');
const moment = require('moment');
const configuration = require('config');
const getMongoClient = require('../../components/mongodb');
const getLogger = require('../../components/logger');
const getContactEmail = require('../../components/getContactEmail');

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-stats-mail-domain', configuration);

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    const generateCSV = codeRegion => {
        return new Promise((resolve, reject) => {
            let total = 0;
            let output = fs.createWriteStream(path.join(__dirname, `../../../.data/organismes-${codeRegion}.csv`));

            output.write(`Siret;Raison sociale;Email;Nombre Avis\n`);

            db.collection('organismes').find({ codeRegion }).transformStream({
                transform: organisme => {
                    return `="${organisme.meta.siretAsString}";"${organisme.raisonSociale}";"${getContactEmail(organisme)}";"${organisme.meta.nbAvis || 0}"\n`;
                }
            })
            .on('data', () => total++)
            .pipe(encodeStream('UTF-16BE'))
            .pipe(output)
            .on('error', e => reject(e))
            .on('finish', async () => {
                logger.info(`Results: ${total} organismes for region ${codeRegion}`);
                resolve();
            });
        });
    };

    logger.info(`Generating CSV file...`);

    try {
        let activeRegions = configuration.app.active_regions.map(region => region.code_region);
        await Promise.all(activeRegions.map(codeRegion => generateCSV(codeRegion)));
        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`);

    } catch (e) {
        abort(e);
    }
};

main();
