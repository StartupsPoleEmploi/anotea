const computeScore = require('../../../../common/utils/computeScore');
const { flatten } = require('../../../job-utils');
const convertCommentToAvis = require('../../../../common/utils/convertCommentToAvis');
const filterAvisReconciliables = require('./utils/filterAvisReconciliables');

module.exports = (intercarif, comments) => {

    return intercarif.actions.reduce((acc, action) => {

        if (!action.lieu_de_formation.coordonnees.adresse) {
            return acc;
        }

        let reconciliated = filterAvisReconciliables(action, comments);

        let id = `${intercarif._attributes.numero}|${action._attributes.numero}`;
        return [
            ...acc,
            {
                _id: id,
                numero: action._attributes.numero,
                lieu_de_formation: {
                    code_postal: action.lieu_de_formation.coordonnees.adresse.codepostal,
                    ville: action.lieu_de_formation.coordonnees.adresse.ville,
                },
                organisme_financeurs: action.organisme_financeurs ?
                    flatten(action.organisme_financeurs.map(of => of.code_financeur)) : [],
                organisme_formateur: {
                    raison_sociale: action.organisme_formateur.raison_sociale_formateur,
                    siret: action.organisme_formateur.siret_formateur.siret,
                    numero: action.organisme_formateur._attributes ? action.organisme_formateur._attributes.numero : null,
                },
                region: action.lieu_de_formation.coordonnees.adresse.region,
                code_region: action.lieu_de_formation.coordonnees.adresse.code_region,
                avis: reconciliated.map(a => convertCommentToAvis(a)) || [],
                score: computeScore(reconciliated),
                formation: {
                    numero: intercarif._attributes.numero,
                    intitule: intercarif.intitule_formation,
                    objectif_formation: intercarif.objectif_formation,
                    domaine_formation: {
                        formacodes: intercarif._meta.formacodes,
                    },
                    certifications: {
                        certifinfos: intercarif._meta.certifinfos,
                    },
                    organisme_responsable: {
                        raison_sociale: intercarif.organisme_formation_responsable.raison_sociale,
                        siret: intercarif.organisme_formation_responsable.siret_organisme_formation.siret,
                        numero: intercarif.organisme_formation_responsable._attributes.numero,
                    },
                },
                meta: {
                    import_date: new Date(),
                    source: {//TODO remove source field in v2
                        numero_formation: intercarif._attributes.numero,
                        numero_action: action._attributes.numero,
                        type: 'intercarif',
                    },
                    reconciliation: {
                        //TODO must be converted into an array in v2
                        organisme_formateur: action.organisme_formateur.siret_formateur.siret,
                        lieu_de_formation: action.lieu_de_formation.coordonnees.adresse.codepostal,
                        certifinfos: intercarif._meta.certifinfos,
                        formacodes: intercarif._meta.formacodes,
                    },
                },
            },
        ];
    }, []);
};
