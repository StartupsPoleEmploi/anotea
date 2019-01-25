#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { encodeStream } = require('iconv-lite');
const path = require('path');
const getOrganismeEmail = require('../../common/utils/getOrganismeEmail');
const { execute } = require('../job-utils');

execute(async ({ logger, db, configuration }) => {

    logger.info('Building email statistics displayed on financer dashboard');

    const generateCSV = codeRegion => {
        return new Promise((resolve, reject) => {
            let total = 0;
            let output = fs.createWriteStream(path.join(__dirname, `../../../../.data/organismes-${codeRegion}.csv`));

            output.write(`Siret;Raison sociale;Email;Nombre Avis\n`);

            db.collection('accounts').find({ profile: 'organisme', codeRegion }).transformStream({
                transform: organisme => {
                    return `="${organisme.meta.siretAsString}";"${organisme.raisonSociale}";"${getOrganismeEmail(organisme)}";"${organisme.meta.nbAvis || 0}"\n`;
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

    let activeRegions = configuration.app.active_regions.map(region => region.code_region);
    await Promise.all(activeRegions.map(codeRegion => generateCSV(codeRegion)));

});
