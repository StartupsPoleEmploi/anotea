const _ = require('lodash');
const moment = require('moment');
const md5 = require('md5');
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
        shouldBeImported: stagiaire => {
            let idf = regions.findRegionByCodeRegion('11');
            let isAfter = moment(stagiaire.formation.action.session.periode.fin).isAfter(moment(`${idf.since}-0000`, 'YYYYMMDD Z'));
            return isAfter && stagiaire.personal.emailValid && stagiaire.formation.action.session.numero === null;
        },
        buildStagiaire: (record, campaign) => {

            try {
                if (_.isEmpty(record)) {
                    return Promise.reject(new Error('Invalid record length'));
                }
                const token = buildToken(record['Mail']);
                const { email, mailDomain } = buildEmail(record['Mail']);
                let numeroAction = record['Numéro Action'];

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
                    refreshKey: md5(`${email};${numeroAction}`),
                    token: token, // used as public ID for URLs
                    personal: {
                        name: record['Individu.Nom'],
                        firstName: record['Prénom'],
                        mailDomain: mailDomain,
                        email: email,
                        phoneNumbers: [record['Tel Portable']],
                        emailValid: true,
                        dnIndividuNational: null,
                        idLocal: null,
                    },
                    formation: {
                        numero: null,
                        intitule: record['Libellé Action'],
                        domaine_formation: {
                            formacodes: [],
                        },
                        certifications: [],
                        action: {
                            numero: numeroAction,
                            lieu_de_formation: {
                                code_postal: record['Code Postal'],
                                ville: record['Ville'],
                            },
                            organisme_financeurs: [{
                                code_financeur: '2',
                            }],
                            organisme_formateur: {
                                numero: null,
                                siret: record['SIRET'],
                                raison_sociale: record['Raison Sociale'],
                                label: record['Raison Sociale'],
                            },
                            session: {
                                id: null,
                                numero: record['Id Session DOKELIO'] === '' ? null : record['Id Session DOKELIO'],
                                periode: {
                                    debut: parseDate(record['Date Entree']),
                                    fin: parseDate(record['Date Sortie']),
                                },
                            },
                        },
                    },
                };

                return Promise.resolve(obj);
            } catch (e) {
                return Promise.reject(e);
            }
        },
    };
};
