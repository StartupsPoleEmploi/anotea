const _ = require('lodash');
const { IdNotFoundError } = require('../../errors');
const { createPaginationDTO } = require('../../../http/routes/api/v1/utils/dto');

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
    return {
        avis: avis.slice(skip, skip + limit),
        meta: {
            pagination: createPaginationDTO(pagination, avis.length)
        },
    };
};
