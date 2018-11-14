const express = require('express');
const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const { paginationValidator, arrayOfValidator } = require('./utils/validators');
const buildProjection = require('./utils/buildProjection');
const convertToExposableAction = require('./dto/convertToExposableAction');
const convertToExposablePagination = require('./dto/convertToExposablePagination');
const tryAndCatch = require('../../tryAndCatch');

module.exports = (db, authService) => {

    let router = express.Router();// eslint-disable-line new-cap
    let collection = db.collection('actionsReconciliees');
    let checkAuth = authService.createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: true });

    router.get('/v1/actions', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            ...paginationValidator(),
            id: arrayOfValidator(Joi.string()),
            numero: arrayOfValidator(Joi.string()),
            region: arrayOfValidator(Joi.string()),
            nb_avis: Joi.number(),
            fields: arrayOfValidator(Joi.string().required()).default([]),
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

        let [total, actions] = await Promise.all([cursor.count(), cursor.toArray()]);

        res.json({
            actions: actions.map(action => convertToExposableAction(action)) || [],
            meta: {
                pagination: convertToExposablePagination(pagination, total)
            },
        });
    }));

    router.get('/v1/actions/:id', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.params, {
            id: Joi.string().required(),
        }, { abortEarly: false });

        let session = await collection.findOne({ _id: parameters.id });

        if (!session) {
            throw Boom.notFound('Numéro d\'action inconnu ou action expirée');
        }

        res.json(convertToExposableAction(session));

    }));

    return router;
};
