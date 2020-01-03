const moment = require("moment");
const computeScore = require("../../../../core/utils/computeScore");
const { flatten } = require("../../../job-utils");
const convertCommentToAvis = require("../../../../core/utils/convertCommentToAvis");

module.exports = (formation, action, session, comments) => {

    return {
        _id: `${formation._attributes.numero}|${action._attributes.numero}|${session._attributes.numero}`,
        numero: session._attributes.numero,
        region: action.lieu_de_formation.coordonnees.adresse.region,
        code_region: action.lieu_de_formation.coordonnees.adresse.code_region,
        periode: {
            debut: moment(`${session.periode.debut} -0000`, "YYYYMMDD Z").toDate(),
            fin: moment(`${session.periode.fin} -0000`, "YYYYMMDD Z").toDate(),
        },
        avis: comments.map(a => convertCommentToAvis(a)) || [],
        score: computeScore(comments),
        formation: {
            numero: formation._attributes.numero,
            intitule: formation.intitule_formation,
            objectif_formation: formation.objectif_formation,
            domaine_formation: {
                formacodes: formation._meta.formacodes,
            },
            certifications: {
                certifinfos: formation._meta.certifinfos,
            },
            organisme_responsable: {
                raison_sociale: formation.organisme_formation_responsable.raison_sociale,
                siret: formation.organisme_formation_responsable.siret_organisme_formation.siret,
                numero: formation.organisme_formation_responsable._attributes.numero,
            },
            action: {
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
            },
        },
        meta: {
            import_date: new Date(),
            source: {//TODO remove source field in v2
                numero_formation: formation._attributes.numero,
                numero_action: action._attributes.numero,
                numero_session: session._attributes.numero,
                type: "intercarif",
            },
            reconciliation: {
                //TODO must be converted into an array in v2
                organisme_formateur: action.organisme_formateur.siret_formateur.siret,
                lieu_de_formation: action.lieu_de_formation.coordonnees.adresse.codepostal,
                certifinfos: formation._meta.certifinfos,
                formacodes: formation._meta.formacodes,
            },
        },
    };
};

