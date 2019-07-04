const computeScore = require('../../../../common/utils/computeScore');
const convertCommentToAvis = require('../../../../common/utils/convertCommentToAvis');

module.exports = (formation, comments) => {

    let sirets = formation.actions.reduce((acc, action) => {
        return [
            ...acc,
            action.organisme_formateur.siret_formateur.siret,
        ];
    }, []);

    let id = formation._attributes.numero;
    return {
        _id: id,
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
        avis: comments.map(a => convertCommentToAvis(a)) || [],
        score: computeScore(comments),
        meta: {
            import_date: new Date(),
            source: {//TODO remove source field in v2
                numero_formation: formation._attributes.numero,
                type: 'intercarif',
            },
            reconciliation: {
                //TODO must be converted into an array in v2
                organisme_formateurs: sirets,
                certifinfos: formation._meta.certifinfos,
                formacodes: formation._meta.formacodes,
            },
        },
    };
};

