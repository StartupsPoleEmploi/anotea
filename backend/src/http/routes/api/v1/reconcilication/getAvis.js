const _ = require('lodash');
const { IdNotFoundError } = require('../../../../../common/errors');
const { createPaginationDTO } = require('../utils/dto');

module.exports = (db, type) => async parameters => {

    let pagination = _.pick(parameters, ['page', 'items_par_page']);
    let limit = pagination.items_par_page;
    let skip = pagination.page * limit;

    let doc = await db.collection(`${type}sReconciliees`).findOne({
        _id: parameters.id
    }, { projection: { avis: 1 } });

    if (!doc) {
        throw new IdNotFoundError(`Numéro de ${type} inconnu ou ${type} expirée`);
    }

    let avis = parameters.commentaires === null ?
        doc.avis :
        doc.avis.filter(avis => parameters.commentaires ? (avis.commentaire || avis.reponse) : !avis.commentaire);

    let sorted = _.orderBy(avis, [a => {
        switch (parameters.tri) {
            case 'notes':
                return a.notes.global;
            case 'formation':
                return a.formation.intitule;
            default:
                return a.formation.action.session.periode.fin;
        }
    }], [parameters.ordre]);

    return {
        avis: sorted.slice(skip, skip + limit),
        meta: {
            pagination: createPaginationDTO(pagination, sorted.length)
        },
    };
};
