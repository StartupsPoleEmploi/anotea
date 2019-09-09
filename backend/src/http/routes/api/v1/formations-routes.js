const express = require('express');
const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../routes-utils');
const validators = require('./utils/validators');
const buildProjection = require('./utils/buildProjection');
const { createFormationDTO, createPaginationDTO } = require('./utils/dto');
const schema = require('./utils/schema');

module.exports = ({ db, middlewares }) => {

    let router = express.Router();// eslint-disable-line new-cap
    let collection = db.collection('formationsReconciliees');
    let { createHMACAuthMiddleware } = middlewares;
    let checkAuth = createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: true });

    router.get('/v1/formations', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            id: validators.arrayOf(Joi.string()),
            numero: validators.arrayOf(Joi.string()),
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
            ...(parameters.nb_avis ? { 'score.nb_avis': { $gte: parameters.nb_avis } } : {}),
        };

        let formations = await collection.find(query)
        .project(buildProjection(parameters.fields))
        .limit(limit)
        .skip(skip);

        let total = await formations.count();
        let stream = formations.transformStream({
            transform: formation => createFormationDTO(formation, { notes_decimales: parameters.notes_decimales })
        });

        return sendArrayAsJsonStream(stream, res, {
            arrayPropertyName: 'formations',
            arrayWrapper: {
                meta: {
                    pagination: createPaginationDTO(pagination, total)
                },
            }
        });
    }));

    router.get('/v1/formations/:id', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...validators.fields(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        let formation = await collection.findOne(
            { _id: parameters.id },
            { projection: buildProjection(parameters.fields) },
        );

        if (!formation) {
            throw Boom.notFound('Numéro de formation inconnu ou formation expirée');
        }

        if (req.headers.accept === 'application/ld+json') {
            res.json(schema.toCourse(formation));
        } else {
            let dto = createFormationDTO(formation, { notes_decimales: parameters.notes_decimales });
            res.json(dto);
        }

    }));

    router.get('/v1/formations/:id/avis', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...validators.pagination(),
            ...validators.commentaires(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        let pagination = _.pick(parameters, ['page', 'items_par_page']);
        let limit = pagination.items_par_page;
        let skip = pagination.page * limit;

        let formation = await collection.findOne({ _id: parameters.id }, { projection: { avis: 1 } });

        if (!formation) {
            throw Boom.notFound('Numéro de formation inconnu ou formation expirée');
        }

        let avis = formation.avis;
        if (parameters.commentaires !== null) {
            avis = avis.filter(avis => parameters.commentaires ? (avis.commentaire || avis.reponse) : !avis.commentaire);
        }

        res.json({
            avis: avis.slice(skip, skip + limit),
            meta: {
                pagination: createPaginationDTO(pagination, avis.length)
            },
        });

    }));

    return router;
};
