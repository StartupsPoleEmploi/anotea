#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { encodeStream } = require('iconv-lite');
const path = require('path');
const moment = require('moment');
const configuration = require('config');
const getMongoClient = require('../../components/mongodb');
const getLogger = require('../../components/logger');
const regions = require('../../components/regions');
const { transformObject } = require('../job-utils');

const codes = {
    '0': 'Autre',
    '1': 'Code(s) obsolète(s)',
    '10': 'Bénéficiaire de l\'action',
    '11': 'Etat - Ministère chargé de l\'emploi',
    '12': 'Etat - Ministère de l\'éducation nationale',
    '13': 'Etat - Autre',
    '14': 'Fonds européens - Autre',
    '15': 'Collectivité territoriale - Autre',
    '16': 'OPCA',
    '17': 'OPACIF',
    '2': 'Collectivité territoriale - Conseil régional',
    '3': 'Fonds européens - FSE',
    '4': 'Pôle emploi',
    '5': 'Entreprise',
    '6': 'ACSÉ (anciennement FASILD)',
    '7': 'AGEFIPH',
    '8': 'Collectivité territoriale - Conseil général',
    '9': 'Collectivité territoriale - Commune',
};

const main = async () => {

    let launchTime = new Date().getTime();
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();
    let { findRegionByCodeRegion } = regions(db);
    let logger = getLogger('anotea-job-stats-mail-domain', configuration);
    let total = 0;
    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    const generateCSV = () => {
        return new Promise((resolve, reject) => {
            let output = fs.createWriteStream(path.join(__dirname, `../../../.data/ventilation-stagiaires.csv`));

            output.write(`Campagne;Libelle Region;Code Region;Libelle Financeur;Code Financeur;Nombre de stagiaires\n`);

            db.collection('trainee').aggregate([
                {
                    $group: {
                        _id: {
                            campaign: '$campaign',
                            codeFinanceurs: '$training.codeFinanceur',
                            codeRegion: '$codeRegion',
                        },
                        nbStagiaires: { $sum: 1 },
                    }
                },
            ])
            .pipe(transformObject(doc => {
                let codeFinanceurs = doc._id.codeFinanceurs;
                let campaign = doc._id.campaign;
                let codeRegion = doc._id.codeRegion;
                let libelleFinanceurs = codeFinanceurs.map(code => codes[code] || 'Inconnu').join(',');
                let libelleRegion = findRegionByCodeRegion(codeRegion).name;
                return `"${campaign}";"${libelleRegion}";="${codeRegion}";"${libelleFinanceurs}";="${codeFinanceurs}";"${doc.nbStagiaires}"\n`;
            }))
            .on('data', () => total++)
            .pipe(encodeStream('UTF-16BE'))
            .pipe(output)
            .on('error', e => reject(e))
            .on('finish', async () => {
                resolve();
            });
        });
    };

    try {

        logger.info(`Generating CSV...`);
        await generateCSV();
        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration}`);
        logger.info(`Results ${total} lines generated`);

    } catch (e) {
        abort(e);
    }
};

main();
