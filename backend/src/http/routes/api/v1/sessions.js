const express = require('express');
const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const { tryAndCatch } = require('../../routes-utils');
const { paginationValidator, arrayOfValidator, notesValeursDecimalesValidator } = require('./utils/validators');
const buildProjection = require('./utils/buildProjection');
const createPaginationDTO = require('./dto/createPaginationDTO');
const createSessionDTO = require('./dto/createSessionDTO');

module.exports = ({ db, middlewares }) => {

    let router = express.Router();// eslint-disable-line new-cap
    let collection = db.collection('sessionsReconciliees');
    let { createHMACAuthMiddleware } = middlewares;
    let checkAuth = createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: true });

    router.get('/v1/sessions', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            id: arrayOfValidator(Joi.string()),
            numero: arrayOfValidator(Joi.string()),
            region: arrayOfValidator(Joi.string()),
            nb_avis: Joi.number(),
            fields: arrayOfValidator(Joi.string().required()).default([]),
            ...paginationValidator(),
            ...notesValeursDecimalesValidator(),
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

        let cursor = await collection.find(query)
        .project(buildProjection(parameters.fields))
        .limit(limit)
        .skip(skip);

        let [total, sessions] = await Promise.all([cursor.count(), cursor.toArray()]);

        res.json({
            sessions: sessions.map(session => {
                return createSessionDTO(session, { notes_valeurs_decimales: parameters.notes_valeurs_decimales });
            }) || [],
            meta: {
                pagination: createPaginationDTO(pagination, total)
            },
        });
    }));

    router.get('/v1/sessions/:id', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...notesValeursDecimalesValidator(),
        }, { abortEarly: false });

        let session = await collection.findOne({ _id: parameters.id });

        if (!session) {
            throw Boom.notFound('Numéro de session inconnu ou session expirée');
        }

        res.json(createSessionDTO(session, { notes_valeurs_decimales: parameters.notes_valeurs_decimales }));

    }));

    return router;
};
