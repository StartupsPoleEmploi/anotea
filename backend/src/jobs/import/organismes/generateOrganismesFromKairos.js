const fs = require('fs');
const parse = require('csv-parse');
const moment = require('moment');
const { transformObject } = require('../../../common/utils/stream-utils');
const getCodeRegionFromKairosRegionName = require('./kairos/getCodeRegionFromKairosRegionName');

const parseDate = value => new Date(moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD') + 'Z');

module.exports = async (db, logger, file) => {

    const buildDocument = async data => {
        return {
            siret: data['SIRET'],
            codeRegion: getCodeRegionFromKairosRegionName(data['Nouvelle région']),
            libelle: data['LIBELLE'],
            region: data['Nouvelle région'],
            nomRGC: data['Nom RGC'],
            prenomRGC: data['Prénom RGC'],
            emailRGC: data['mail RGC'],
            telephoneRGC: data['Téléphone RGC'],
            assedic: data['ASSEDIC'],
            convention: data['convention'],
            dateDebut: parseDate(data['date début']),
            dateFin: parseDate(data['date fin']),
        };
    };

    let stats = {
        inserted: 0,
        invalid: 0,
    };

    await db.collection('kairos_organismes').removeMany({});

    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
        .pipe(parse({
            delimiter: '|',
            quote: '',
            columns: [
                'SIRET',
                'LIBELLE',
                'REGION',
                'Nouvelle région',
                'Nom RGC',
                'Prénom RGC',
                'mail RGC',
                'Téléphone RGC',
                'ASSEDIC',
                'convention',
                'date début',
                'date fin',
            ],
        }))
        .pipe(transformObject(async data => {
            try {
                let document = await buildDocument(data);

                await db.collection('kairos_organismes').insertOne(document);
                return { organisme: document };
            } catch (e) {
                return { error: e, organisme: data };
            }
        }, { ignoreFirstLine: true }))
        .on('data', ({ organisme, error }) => {
            if (error) {
                stats.invalid++;
                logger.error(`Organisme cannot be imported`, organisme, error);
            } else {
                stats.inserted++;
                logger.debug(`Organisme imported ${organisme.siret}`);
            }
        })
        .on('error', err => reject(err))
        .on('finish', async () => stats.invalid === 0 ? resolve(stats) : reject(stats));
    });

};
