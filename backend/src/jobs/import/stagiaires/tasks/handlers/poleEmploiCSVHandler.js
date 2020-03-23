const _ = require('lodash');
const moment = require('moment');
const { buildToken } = require('../utils/utils');
const { isConseilRegional } = require('../../../../../core/utils/financeurs');
const md5 = require('md5');

const parseDate = value => new Date(value + 'Z');

module.exports = (db, regions) => {

    const buildCodeFinanceur = data => {
        let code = data.replace(/ /g, '');
        if (_.isEmpty(code)) {
            return [];
        }

        let res = code.indexOf(';') !== -1 ? code.split(';') : [code];
        return res.map(code => ({ code_financeur: code }));
    };

    const buildFormationTitle = data => {
        if (data.startsWith('"') && data.endsWith('"')) {
            return data.substring(1, data.length - 1);
        }
        return data;
    };

    const removeEmptyValues = array => array.filter(n => !_.isEmpty(n));

    return {
        name: 'Pôle Emploi',
        csvOptions: {
            delimiter: '|',
            columns: [
                'c_nomcorrespondance',
                'c_prenomcorrespondance',
                'c_adresseemail',
                'c_telephone1',
                'c_telephone2',
                'c_validitemail_id',
                'dn_individu_national',
                'dn_session_id',
                'c_individulocal',
                'dc_formation_id',
                'dc_lblformation',
                'dd_datedebutplanformation',
                'dd_datefinplanformation',
                'dc_organisme_id',
                'dc_cp_lieuformation',
                'dc_insee_lieuformation',
                'dc_ville_lieuformation',
                'dc_formacode_ppal_id',
                'dc_formacode_secondaire1_id',
                'dc_formacode_secondaire2_id',
                'dc_formacode_secondaire3_id',
                'dc_formacode_secondaire4_id',
                'dn_certifinfo_1_id',
                'dn_certifinfo_2_id',
                'dn_certifinfo_3_id',
                'dn_certifinfo_4_id',
                'dn_certifinfo_5_id',
                'dc_siret',
                'dc_lblorganisme',
                'dc_raisonsociale',
                'departement',
                'dc_numeroicsession',
                'dc_numeroicaction',
                'liste_financeur',
                'c_dispositifformation',
            ]
        },
        shouldBeImported: stagiaire => {
            let region = regions.findActiveRegions().find(region => region.codeRegion === stagiaire.codeRegion);
            let conseilRegional = stagiaire.formation.action.organisme_financeurs.filter(o => {
                return isConseilRegional(o.code_financeur);
            }).length > 0;

            let isValid = () => region && stagiaire.individu.emailValid;

            let isAfter = () => {
                let since = conseilRegional && region.conseil_regional.since ? region.conseil_regional.since : region.since;
                return moment(stagiaire.formation.action.session.periode.fin).isAfter(moment(`${since} -0000`, 'YYYYMMDD Z'));
            };

            let isNotExcluded = () => {
                if (conseilRegional && !region.conseil_regional.active) {
                    return false;
                }

                if (conseilRegional &&
                    region.conseil_regional.active &&
                    region.conseil_regional.import === 'certifications_only') {
                    return stagiaire.formation.certifications.length > 0;
                }
                return true;
            };

            return isValid() && isAfter() && isNotExcluded();
        },
        buildStagiaire: async (record, campaign) => {

            if (_.isEmpty(record)) {
                throw new Error(`Données CSV invalides ${record}`);
            }

            let region = regions.findRegionByPostalCode(record['dc_cp_lieuformation']);
            let token = buildToken(record['c_adresseemail']);
            let email = record['c_adresseemail'].toLowerCase();
            let idSession = record['dn_session_id'];
            let identifiantLocal = record['c_individulocal'];

            return {
                _id: campaign.name + '/' + token,
                campaign: campaign.name,
                campaignDate: campaign.date,
                importDate: new Date(),
                unsubscribe: false,
                mailSent: false,
                avisCreated: false,
                token: token,
                codeRegion: region.codeRegion,
                refreshKey: md5(`${identifiantLocal};${idSession}`),
                dispositifFinancement: record['c_dispositifformation'],
                individu: {
                    nom: record['c_nomcorrespondance'],
                    prenom: record['c_prenomcorrespondance'],
                    email: email,
                    telephones: removeEmptyValues([record['c_telephone1'], record['c_telephone2']]),
                    emailValid: record['c_validitemail_id'] === 'V',
                    identifiant_pe: record['dn_individu_national'],
                    identifiant_local: identifiantLocal
                },
                formation: {
                    numero: record['dc_formation_id'],
                    intitule: buildFormationTitle(record['dc_lblformation']),
                    domaine_formation: {
                        formacodes: removeEmptyValues([
                            record['dc_formacode_ppal_id'],
                            record['dc_formacode_secondaire1_id'],
                            record['dc_formacode_secondaire2_id'],
                            record['dc_formacode_secondaire3_id'],
                            record['dc_formacode_secondaire4_id'],
                        ]),
                    },
                    certifications: removeEmptyValues([
                        record['dn_certifinfo_1_id'],
                        record['dn_certifinfo_2_id'],
                        record['dn_certifinfo_3_id'],
                        record['dn_certifinfo_4_id'],
                        record['dn_certifinfo_5_id'],
                    ]).map(c => ({ certif_info: c })),
                    action: {
                        numero: record['dc_numeroicaction'],
                        lieu_de_formation: {
                            code_postal: record['dc_cp_lieuformation'],
                            ville: record['dc_ville_lieuformation'],
                        },
                        organisme_financeurs: buildCodeFinanceur(record['liste_financeur']),
                        organisme_formateur: {
                            raison_sociale: record['dc_raisonsociale'],
                            label: record['dc_lblorganisme'],
                            siret: record['dc_siret'],
                            numero: record['dc_organisme_id'],
                        },
                        session: {
                            id: idSession,
                            numero: record['dc_numeroicsession'],
                            periode: {
                                debut: parseDate(record['dd_datedebutplanformation']),
                                fin: parseDate(record['dd_datefinplanformation']),
                            },
                        },
                    },
                },
            };
        },
    };
};
