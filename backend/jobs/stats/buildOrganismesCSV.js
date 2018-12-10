#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { encodeStream } = require('iconv-lite');
const path = require('path');
const moment = require('moment');
const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../components/mongodb');
const getLogger = require('../../components/logger');
const getContactEmail = require('../../components/getContactEmail');

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let logger = getLogger('anotea-job-stats-mail-domain', configuration);
    let abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    cli.option('-r, --region [region]')
    .option('-o, --output [output]')
    .parse(process.argv);

    let region = cli.region;
    if (!region) {
        return abort('Region is required');
    }

    logger.info(`Generating CSV file...`);

    let total = 0;
    let output = fs.createWriteStream(cli.output || path.join(__dirname, `../../../.data/organismes-${region}.csv`));

    output.write(`Siret;Raison sociale;Email;Nombre Avis\n`);

    db.collection('organismes').find({ codeRegion: region }).transformStream({
        transform: organisme => {
            return `="${organisme.meta.siretAsString}";"${organisme.raisonSociale}";"${getContactEmail(organisme)}";"${organisme.meta.nbAvis || 0}"\n`;
        }
    })
    .on('data', () => total++)
    .pipe(encodeStream('UTF-16BE'))
    .pipe(output)
    .on('error', e => abort(e))
    .on('finish', async () => {
        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`);
        logger.info(`Results: ${total} organismes for region ${region}`);
    });
};

main();
