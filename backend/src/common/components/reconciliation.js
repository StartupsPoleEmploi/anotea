const _ = require('lodash');
const buildProjection = require('../../http/routes/api/v1/utils/buildProjection');
const { createIntercarifDTO, createPaginationDTO } = require('../../http/routes/api/v1/utils/dto');
const schema = require('../../http/routes/api/v1/utils/schema');
const { jsonStream } = require('../utils/stream-utils');
const { IdNotFoundError } = require('../errors');

module.exports = db => {
    return {
        getDocumentsAsStream: async (type, parameters, options = {}) => {

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
        },
        getDocument: async (type, parameters, options = {}) => {

            let doc = await db.collection(`${type}sReconciliees`).findOne(
                { _id: parameters.id },
                { projection: buildProjection(parameters.fields) },
            );

            if (!doc) {
                throw new IdNotFoundError(`Numéro ${type} inconnu ou ${type} expirée`);
            }

            return options.jsonLd ? schema.toCourse(doc) :
                createIntercarifDTO(doc, { notes_decimales: parameters.notes_decimales });
        },
        getAvis: async (type, parameters) => {

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
        },
    };
};
