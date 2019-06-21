const _ = require('lodash');
const moment = require('moment');
const { buildToken, buildEmail } = require('../utils/utils');

const parseDate = value => new Date(moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD') + 'Z');

module.exports = () => {
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
        shouldBeImported: async trainee => trainee.trainee.emailValid && trainee.training.infoCarif.numeroSession === null,
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
                        origineSession: null,
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
                        certifInfo: {
                            id: null,
                            label: null
                        },
                        idSession: null,
                        formacode: null,
                        referencement: null,
                        infoCarif: {
                            numeroAction: null,
                            numeroSession: record['Id Session DOKELIO'] === '' ? null : record['Id Session DOKELIO']
                        },
                        codeFinanceur: ['2'],
                        niveauEntree: null,
                        niveauSortie: null,
                        dureeHebdo: null,
                        dureeMaxi: null,
                        dureeEntreprise: null,
                        dureeIndicative: null,
                        nombreHeuresCentre: null,
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
