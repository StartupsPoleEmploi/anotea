const express = require('express');
const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const { paginationValidator, arrayOfValidator } = require('./utils/validators');
const buildProjection = require('./utils/buildProjection');
const convertToFormationDTO = require('./dto/convertToExposableFormation');
const convertToPaginationDTO = require('./dto/convertToExposablePagination');
const { tryAndCatch } = require('../../routes-utils');

module.exports = ({ db, authMiddlewares }) => {

    let router = express.Router();// eslint-disable-line new-cap
    let collection = db.collection('formationsReconciliees');
    let { createHMACAuthMiddleware } = authMiddlewares;
    let checkAuth = createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: true });

    router.get('/v1/formations', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            ...paginationValidator(),
            id: arrayOfValidator(Joi.string()),
            numero: arrayOfValidator(Joi.string()),
            nb_avis: Joi.number(),
            fields: arrayOfValidator(Joi.string().required()).default([]),
        }, { abortEarly: false });

        let pagination = _.pick(parameters, ['page', 'items_par_page']);
        let limit = pagination.items_par_page;
        let skip = pagination.page * limit;
        let query = {
            ...(parameters.id ? { '_id': { $in: parameters.id } } : {}),
            ...(parameters.numero ? { 'numero': { $in: parameters.numero } } : {}),
            ...(parameters.nb_avis ? { 'score.nb_avis': { $gte: parameters.nb_avis } } : {}),
        };

        let cursor = await collection.find(query)
        .project(buildProjection(parameters.fields))
        .limit(limit)
        .skip(skip);

        let [total, formations] = await Promise.all([cursor.count(), cursor.toArray()]);

        res.json({
            formations: formations.map(formation => convertToFormationDTO(formation)) || [],
            meta: {
                pagination: convertToPaginationDTO(pagination, total)
            },
        });
    }));

    router.get('/v1/formations/:id', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.params, {
            id: Joi.string().required(),
        }, { abortEarly: false });

        let session = await collection.findOne({ _id: parameters.id });

        if (!session) {
            throw Boom.notFound('Numéro de formation inconnu ou formation expirée');
        }

        res.json(convertToFormationDTO(session));

    }));

    return router;
};
