const fs = require('fs');
const moment = require('moment');
const { fromCsvStream } = require('../../../job-utils');
const getCodeRegionFromKairosRegionName = require('./getCodeRegionFromKairosRegionName');

const parseDate = value => new Date(moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD') + 'Z');

module.exports = file => {
    return fromCsvStream(
        fs.createReadStream(file),
        {
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
        },
        data => {
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
        });
};
