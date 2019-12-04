const express = require('express');
const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../routes-utils');
const validators = require('./utils/validators');
const buildProjection = require('./utils/buildProjection');
const { createActionDTO, createPaginationDTO } = require('./utils/dto');
const schema = require('./utils/schema');

module.exports = ({ db, middlewares }) => {

    let router = express.Router();// eslint-disable-line new-cap
    let collection = db.collection('actionsReconciliees');
    let { createHMACAuthMiddleware } = middlewares;
    let checkAuth = createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: true });

    router.get('/v1/actions', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            id: validators.arrayOf(Joi.string()),
            numero: validators.arrayOf(Joi.string()),
            region: validators.arrayOf(Joi.string()),
            nb_avis: Joi.number(),
            ...validators.fields(),
            ...validators.pagination(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        let pagination = _.pick(parameters, ['page', 'items_par_page']);
        let limit = pagination.items_par_page;
        let skip = pagination.page * limit;
        let query = {
            ...(parameters.id ? { '_id': { $in: parameters.id } } : {}),
            ...(parameters.numero ? { 'numero': { $in: parameters.numero } } : {}),
            ...(parameters.region ? { 'region': { $in: parameters.region } } : {}),
            ...(parameters.nb_avis ? { 'score.nb_avis': { $gte: parameters.nb_avis } } : {}),
        };

        let actions = await collection.find(query)
        .project(buildProjection(parameters.fields))
        .limit(limit)
        .skip(skip);

        let total = await actions.count();
        let stream = actions.transformStream({
            transform: action => createActionDTO(action, { notes_decimales: parameters.notes_decimales })
        });

        return sendArrayAsJsonStream(stream, res, {
            arrayPropertyName: 'actions',
            arrayWrapper: {
                meta: {
                    pagination: createPaginationDTO(pagination, total)
                },
            }
        });
    }));

    router.get('/v1/actions/:id', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...validators.fields(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        let action = await collection.findOne(
            { _id: parameters.id },
            { projection: buildProjection(parameters.fields) }
        );

        if (!action) {
            throw Boom.notFound('Numéro d\'action inconnu ou action expirée');
        }

        if (req.headers.accept === 'application/ld+json') {
            res.json(schema.toCourse(action.formation, { score: action.score }));
        } else {
            let dto = createActionDTO(action, { notes_decimales: parameters.notes_decimales });
            res.json(dto);
        }
    }));

    router.get('/v1/actions/:id/avis', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...validators.pagination(),
            ...validators.commentaires(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        let pagination = _.pick(parameters, ['page', 'items_par_page']);
        let limit = pagination.items_par_page;
        let skip = pagination.page * limit;

        let action = await collection.findOne({ _id: parameters.id }, { projection: { avis: 1 } });

        if (!action) {
            throw Boom.notFound('Numéro d\'action inconnu ou action expirée');
        }

        let avis = parameters.commentaires === null ?
            action.avis :
            action.avis.filter(avis => parameters.commentaires ? (avis.commentaire || avis.reponse) : !avis.commentaire);


        res.json({
            avis: avis.slice(skip, skip + limit),
            meta: {
                pagination: createPaginationDTO(pagination, avis.length)
            },
        });

    }));

    return router;
};
