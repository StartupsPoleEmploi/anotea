const _ = require('lodash');
const buildProjection = require('../utils/buildProjection');
const { createIntercarifDTO, createPaginationDTO } = require('../utils/dto');
const { jsonStream } = require('../../../../core/utils/stream-utils');

module.exports = (db, type) => async (parameters, options = {}) => {

    let pagination = _.pick(parameters, ['page', 'items_par_page']);
    let limit = pagination.items_par_page;
    let skip = pagination.page * limit;

    let documents = await db.collection(`${type}sReconciliees`).find({
        ...(parameters.id ? { '_id': { $in: parameters.id } } : {}),
        ...(parameters.numero ? { 'numero': { $in: parameters.numero } } : {}),
        ...(parameters.nb_avis ? { 'score.nb_avis': { $gte: parameters.nb_avis } } : {}),
        ...options,
    })
    .project(buildProjection(parameters.fields))
    .limit(limit)
    .skip(skip);

    let total = await documents.count();
    let stream = documents.transformStream({
        transform: doc => createIntercarifDTO(doc, { notes_decimales: parameters.notes_decimales })
    });

    return stream.pipe(jsonStream({
        arrayPropertyName: `${type}s`,
        arrayWrapper: {
            meta: {
                pagination: createPaginationDTO(pagination, total)
            },
        }
    }));
};
