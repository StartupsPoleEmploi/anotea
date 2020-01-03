const _ = require('lodash');
const moment = require('moment');
const { buildToken, buildEmail } = require('../utils/utils');
const { isConseilRegional } = require('../../../../../core/utils/financeurs');

const parseDate = value => new Date(value + 'Z');

module.exports = (db, regions) => {

    const buildCodeFinanceur = data => {
        let code = data.replace(/ /g, '');
        if (_.isEmpty(code)) {
            return [];
        }

        return code.indexOf(';') !== -1 ? code.split(';') : [code];
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
            ]
        },
        getKey: trainee => {
            return {
                trainee: {
                    email: trainee.trainee.email,
                },
                training: {
                    idSession: trainee.training.idSession,
                }
            };
        },
        shouldBeImported: trainee => {
            let region = regions.findActiveRegions().find(region => region.codeRegion === trainee.codeRegion);
            let conseilRegional = trainee.training.codeFinanceur.filter(c => isConseilRegional(c)).length > 0;

            let isValid = () => region && trainee.trainee.emailValid;

            let isAfter = () => {
                let since = conseilRegional && region.conseil_regional.since ? region.conseil_regional.since : region.since;
                return moment(trainee.training.scheduledEndDate).isAfter(moment(`${since} -0000`, 'YYYYMMDD Z'));
            };

            let isNotExcluded = () => {
                if (conseilRegional && !region.conseil_regional.active) {
                    return false;
                }

                if (conseilRegional &&
                    region.conseil_regional.active &&
                    region.conseil_regional.import === 'certifications_only') {
                    return trainee.training.certifInfos.length > 0;
                }
                return true;
            };

            return isValid() && isAfter() && isNotExcluded();
        },
        buildTrainee: async (record, campaign) => {

            if (_.isEmpty(record)) {
                throw new Error(`Données CSV invalides ${record}`);
            }

            let region = regions.findRegionByPostalCode(record['dc_cp_lieuformation']);
            let token = buildToken(record['c_adresseemail']);
            let { email, mailDomain } = buildEmail(record['c_adresseemail']);
            let inseeCode = record['dc_insee_lieuformation'];

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
                trainee: {
                    name: record['c_nomcorrespondance'],
                    firstName: record['c_prenomcorrespondance'],
                    mailDomain: mailDomain,
                    email: email,
                    phoneNumbers: removeEmptyValues([record['c_telephone1'], record['c_telephone2']]),
                    emailValid: record['c_validitemail_id'] === 'V',
                    dnIndividuNational: record['dn_individu_national'],
                    idLocal: record['c_individulocal']
                },
                training: {
                    idFormation: record['dc_formation_id'],
                    title: buildFormationTitle(record['dc_lblformation']),
                    startDate: parseDate(record['dd_datedebutplanformation']),
                    scheduledEndDate: parseDate(record['dd_datefinplanformation']),
                    organisation: {
                        id: record['dc_organisme_id'],
                        siret: record['dc_siret'],
                        label: record['dc_lblorganisme'],
                        name: record['dc_raisonsociale']
                    },
                    place: {
                        departement: record['departement'],
                        postalCode: record['dc_cp_lieuformation'],
                        ...(_.isEmpty(inseeCode) ? {} : { inseeCode }),
                        city: record['dc_ville_lieuformation']
                    },
                    certifInfos: removeEmptyValues([
                        record['dn_certifinfo_1_id'],
                        record['dn_certifinfo_2_id'],
                        record['dn_certifinfo_3_id'],
                        record['dn_certifinfo_4_id'],
                        record['dn_certifinfo_5_id'],
                    ]),
                    formacodes: removeEmptyValues([
                        record['dc_formacode_ppal_id'],
                        record['dc_formacode_secondaire1_id'],
                        record['dc_formacode_secondaire2_id'],
                        record['dc_formacode_secondaire3_id'],
                        record['dc_formacode_secondaire4_id'],
                    ]),
                    idSession: record['dn_session_id'],
                    infoCarif: {
                        numeroSession: record['dc_numeroicsession'],
                        numeroAction: record['dc_numeroicaction']
                    },
                    codeFinanceur: buildCodeFinanceur(record['liste_financeur']),
                }
            };
        },
    };
};
