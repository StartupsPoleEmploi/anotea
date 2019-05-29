const _ = require('lodash');
const { buildToken, buildEmail } = require('../utils');

const parseDate = value => new Date(value + 'Z');

module.exports = (db, regions) => {

    const buildCodeFinanceur = data => {
        if (data !== 'NULL') {
            if (data.indexOf(';') !== -1) {
                return data.split(';');
            } else if (!isNaN(parseInt(data, 10))) {
                return [data];
            }
        }
        return [];
    };

    const buildFormationTitle = data => {
        if (data.startsWith('"') && data.endsWith('"')) {
            return data.substring(1, data.length - 1);
        }
        return data;
    };

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
                'dc_aes_recue',
                'dc_referencement',
                'c_individulocal',
                'dc_formation_id',
                'dc_origine_session_id',
                'dc_lblformation',
                'dd_datedebutmodule',
                'dd_datefinmodule',
                'dc_organisme_id',
                'dc_cp_lieuformation',
                'dc_ville_lieuformation',
                'dc_formacode_ppal_id',
                'dn_certifinfo_1_id',
                'dc_lblcertifinfo',
                'dc_siret',
                'dc_lblorganisme',
                'dc_raisonsociale',
                'departement',
                'dc_niveauformation_entree_id',
                'dc_niveauformation_sortie_id',
                'dn_dureehebdo',
                'dn_dureemaxi',
                'dn_dureeentreprise',
                'dc_dureeindicative',
                'dn_nombreheurescentre',
                'dc_numeroicsession',
                'dc_numeroicaction',
                'kn_session_id',
                'liste_financeur',
            ],
        },
        shouldBeImported: async trainee => {
            let region = regions.findActiveRegions().find(region => region.codeRegion === trainee.codeRegion);

            let isValid = trainee => region && trainee.trainee.emailValid;

            let isIncluded = trainee => {

                let isConseilRegional = trainee.training.codeFinanceur.includes('2');

                if (isConseilRegional && region.conseil_regional === 'excluded') {
                    return false;
                }
                if (isConseilRegional && region.conseil_regional === 'certifications_only') {
                    return !_.isEmpty(trainee.training.certifInfo.id);
                }
                return true;
            };

            let doesNotExist = async trainee => {
                let count = await db.collection('trainee').countDocuments({
                    'trainee.email': trainee.trainee.email,
                    'training.infoCarif.numeroSession': trainee.training.infoCarif.numeroSession
                });

                return count === 0;
            };

            return isValid(trainee) && isIncluded(trainee) && (await doesNotExist(trainee));


        },
        buildTrainee: async (record, campaign) => {

            try {
                if (_.isEmpty(record)) {
                    return Promise.reject(new Error(`Données CSV invalides ${record}`));
                }

                let region = regions.findRegionByPostalCode(record['dc_cp_lieuformation']);
                let token = buildToken(record['c_adresseemail']);
                let { email, mailDomain } = buildEmail(record['c_adresseemail']);

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
                        phoneNumbers: [record['c_telephone1'], record['c_telephone2']],
                        emailValid: record['c_validitemail_id'] === 'V',
                        dnIndividuNational: record['dn_individu_national'],
                        idLocal: record['c_individulocal']
                    },
                    training: {
                        idFormation: record['dc_formation_id'],
                        origineSession: record['dc_origine_session_id'],
                        title: buildFormationTitle(record['dc_lblformation']),
                        startDate: parseDate(record['dd_datedebutmodule']),
                        scheduledEndDate: parseDate(record['dd_datefinmodule']),
                        organisation: {
                            id: record['dc_organisme_id'],
                            siret: record['dc_siret'],
                            label: record['dc_lblorganisme'],
                            name: record['dc_raisonsociale']
                        },
                        place: {
                            departement: record['departement'],
                            postalCode: record['dc_cp_lieuformation'],
                            city: record['dc_ville_lieuformation']
                        },
                        certifInfo: {
                            id: record['dn_certifinfo_1_id'],
                            label: record['dc_lblcertifinfo']
                        },
                        idSession: record['dn_session_id'],
                        formacode: record['dc_formacode_ppal_id'],
                        aesRecu: record['dc_aes_recue'],
                        referencement: record['dc_referencement'],
                        infoCarif: {
                            numeroSession: record['dc_numeroicsession'],
                            numeroAction: record['dc_numeroicaction']
                        },
                        codeFinanceur: buildCodeFinanceur(record['liste_financeur']),
                        niveauEntree: parseInt(record['dc_niveauformation_entree_id'], 10) || null,
                        niveauSortie: parseInt(record['dc_niveauformation_sortie_id'], 10) || null,
                        dureeHebdo: parseInt(record['dn_dureehebdo'], 10) || null,
                        dureeMaxi: parseInt(record['dn_dureemaxi'], 10) || null,
                        dureeEntreprise: parseInt(record['dn_dureeentreprise'], 10) || null,
                        dureeIndicative: record['dc_dureeindicative'],
                        nombreHeuresCentre: parseInt(record['dn_nombreheurescentre'], 10) || null,
                    }
                };

            } catch (e) {
                return Promise.reject(e);
            }
        },
    };
};
