const computeScore = require('../../../../common/utils/computeScore');
const convertCommentToAvis = require('../../../../common/utils/convertCommentToAvis');

module.exports = (intercarif, allComments) => {

    let sirets = intercarif.actions.reduce((acc, action) => {
        return [
            ...acc,
            action.organisme_formateur.siret_formateur.siret,
        ];
    }, []);

    let id = intercarif._attributes.numero;
    return {
        _id: id,
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
        avis: allComments.map(a => convertCommentToAvis(a)) || [],
        score: computeScore(allComments),
        meta: {
            import_date: new Date(),
            source: {//TODO remove source field in v2
                numero_formation: intercarif._attributes.numero,
                type: 'intercarif',
            },
            reconciliation: {
                //TODO must be converted into an array in v2
                organisme_formateurs: sirets,
                certifinfos: intercarif._meta.certifinfos,
                formacodes: intercarif._meta.formacodes,
            },
        },
    };
};

