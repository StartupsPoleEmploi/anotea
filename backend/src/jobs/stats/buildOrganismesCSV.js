#!/usr/bin/env node
'use strict';

const fs = require('fs');
const cli = require('commander');
const { encodeStream } = require('iconv-lite');
const path = require('path');
const getOrganismeEmail = require('../../common/utils/getOrganismeEmail');
const { execute } = require('../job-utils');

cli.description('Export organismes per active region')
.parse(process.argv);

execute(async ({ logger, db, configuration }) => {

    logger.info('Building email statistics displayed on financer dashboard');

    const generateCSV = ({ name, code_region: codeRegion }) => {
        return new Promise((resolve, reject) => {
            let total = 0;
            let output = fs.createWriteStream(path.join(__dirname, `../../../../.data/organismes-${name}-${codeRegion}.csv`));

            output.write(`Siret;Raison sociale;Email;Nombre Avis;Kairos\n`);

            db.collection('accounts').find({ profile: 'organisme', codeRegion }).transformStream({
                transform: organisme => {
                    let kairos = !!organisme.sources.find(s => s === 'kairos');
                    let email = getOrganismeEmail(organisme);
                    let nbAvis = organisme.score.nb_avis;

                    return `="${organisme.meta.siretAsString}";"${organisme.raisonSociale}";"${email}";"${nbAvis}";"${kairos ? 'oui' : 'non'}"\n`;
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

    let activeRegions = configuration.app.active_regions;
    await Promise.all(activeRegions.map(region => generateCSV(region)));

});
