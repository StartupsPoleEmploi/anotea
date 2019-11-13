const _ = require('lodash');
const moment = require('moment');
const { buildToken, buildEmail } = require('../utils/utils');

const parseDate = value => new Date(moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD') + 'Z');

module.exports = (db, regions) => {
    return {
        name: 'Île-De-France',
        csvOptions: {
            delimiter: ';',
            columns: [
                'Identifiant Stagiaire',
                'Identifiant Composante',
                'Raison Sociale',
                'SIRET',
                'Numéro Action',
                'Libellé Action',
                'Individu.Nom',
                'Prénom',
                'Tel Portable',
                'Mail',
                'Date Entree',
                'Date Sortie Prevue',
                'Date Sortie',
                'Site.Nom',
                'Code Postal',
                'Ville',
                'Id Session DOKELIO',
            ]
        },
        getKey: trainee => {
            return {
                sourceIDF: true,
                trainee: {
                    email: trainee.trainee.email,
                },
                training: {
                    infoRegion: {
                        idActionFormation: trainee.training.infoRegion.idActionFormation,
                    }
                }
            };
        },
        shouldBeImported: trainee => {
            let idf = regions.findRegionByCodeRegion('11');
            let isAfter = moment(trainee.training.scheduledEndDate).isAfter(moment(`${idf.since}-0000`, 'YYYYMMDD Z'));
            return isAfter && trainee.trainee.emailValid && trainee.training.infoCarif.numeroSession === null;
        },
        buildTrainee: (record, campaign) => {

            try {
                if (_.isEmpty(record)) {
                    return Promise.reject(new Error('Invalid record length'));
                }
                const token = buildToken(record['Mail']);
                const { email, mailDomain } = buildEmail(record['Mail']);

                let obj = {
                    _id: campaign.name + '/' + token,
                    campaign: campaign.name,
                    campaignDate: campaign.date,
                    importDate: new Date(),
                    sourceIDF: true,
                    avisCreated: false,
                    unsubscribe: false,
                    mailSent: false,
                    codeRegion: '11',
                    token: token, // used as public ID for URLs
                    trainee: {
                        name: record['Individu.Nom'],
                        firstName: record['Prénom'],
                        mailDomain: mailDomain,
                        email: email,
                        phoneNumbers: [record['Tel Portable']],
                        emailValid: true,
                        dnIndividuNational: null,
                        idLocal: null,
                    },
                    training: {
                        idFormation: null,
                        title: record['Libellé Action'],
                        startDate: parseDate(record['Date Entree']),
                        scheduledEndDate: parseDate(record['Date Sortie']),
                        organisation: {
                            id: null,
                            siret: record['SIRET'],
                            label: record['Raison Sociale'],
                            name: record['Raison Sociale']
                        },
                        place: {
                            postalCode: record['Code Postal'],
                            city: record['Ville']
                        },
                        certifInfos: [],
                        idSession: null,
                        formacode: null,
                        infoCarif: {
                            numeroAction: null,
                            numeroSession: record['Id Session DOKELIO'] === '' ? null : record['Id Session DOKELIO']
                        },
                        codeFinanceur: ['2'],
                        infoRegion: {
                            idTrainee: record['Identifiant Stagiaire'],
                            idActionFormation: record['Numéro Action'],
                            idParcours: record['Identifiant Composante']
                        }
                    },
                };

                return Promise.resolve(obj);
            } catch (e) {
                return Promise.reject(e);
            }
        },
    };
};
