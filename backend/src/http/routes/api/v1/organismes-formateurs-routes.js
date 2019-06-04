const express = require('express');
const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const { tryAndCatch } = require('../../routes-utils');
const { paginationValidator, arrayOfValidator, notesDecimalesValidator, commentairesValidator } = require('./utils/validators');
const buildProjection = require('./utils/buildProjection');
const { createOrganismeFomateurDTO, createPaginationDTO, createAvisDTO } = require('./utils/dto');

module.exports = ({ db, middlewares }) => {

    let router = express.Router();// eslint-disable-line new-cap
    let collection = db.collection('accounts');
    let { createHMACAuthMiddleware } = middlewares;
    let checkAuth = createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: true });

    router.get('/v1/organismes-formateurs', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            ...paginationValidator(),
            id: arrayOfValidator(Joi.string()),
            numero: arrayOfValidator(Joi.string()),
            siret: arrayOfValidator(Joi.string()),
            lieu_de_formation: arrayOfValidator(Joi.string()),
            nb_avis: Joi.number(),
            fields: arrayOfValidator(Joi.string().required()).default([]),
            ...paginationValidator(),
            ...notesDecimalesValidator(),
        }, { abortEarly: false });

        let pagination = _.pick(parameters, ['page', 'items_par_page']);
        let limit = pagination.items_par_page;
        let skip = pagination.page * limit;
        let query = {
            ...(parameters.id ? { '_id': { $in: parameters.id.map(id => parseInt(id)) } } : {}),
            ...(parameters.numero ? { 'numero': { $in: parameters.numero } } : {}),
            ...(parameters.siret ? { 'SIRET': { $in: parameters.siret.map(id => parseInt(id)) } } : {}),
            ...(parameters.nb_avis ? { 'score.nb_avis': { $gte: parameters.nb_avis } } : {}),
            ...(parameters.lieu_de_formation ? {
                $or: [
                    { 'lieux_de_formation.adresse.code_postal': { $in: parameters.lieu_de_formation } },
                    { 'lieux_de_formation.adresse.region': { $in: parameters.lieu_de_formation } }
                ]
            } : {}),
        };

        let cursor = await collection.find(query)
        .project(buildProjection(parameters.fields))
        .limit(limit)
        .skip(skip);

        let [total, organismes] = await Promise.all([cursor.count(), cursor.toArray()]);

        res.json({
            organismes_formateurs: organismes.map(of => {
                return createOrganismeFomateurDTO(of, { notes_decimales: parameters.notes_decimales });
            }) || [],
            meta: {
                pagination: createPaginationDTO(pagination, total)
            },
        });
    }));

    router.get('/v1/organismes-formateurs/:id', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...notesDecimalesValidator(),
        }, { abortEarly: false });


        let organisme = await collection.findOne({ _id: parseInt(parameters.id) });

        if (!organisme) {
            throw Boom.notFound('Identifiant inconnu');
        }

        res.json(createOrganismeFomateurDTO(organisme, { notes_decimales: parameters.notes_decimales }));
    }));

    router.get('/v1/organismes-formateurs/:id/avis', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...paginationValidator(),
            ...notesDecimalesValidator(),
            ...commentairesValidator(),
        }, { abortEarly: false });

        let pagination = _.pick(parameters, ['page', 'items_par_page']);
        let limit = pagination.items_par_page;
        let skip = pagination.page * limit;

        let cursor = await db.collection('comment')
        .find({
            'training.organisation.siret': parameters.id,
            '$and': [
                parameters.commentaires === false ? { comment: { $exists: parameters.commentaires } } : {},
                { rejected: false },
            ]
        })
        .sort({ date: -1 })
        .limit(limit)
        .skip(skip);

        let [total, comment, organisme] = await Promise.all([
            cursor.count(),
            cursor.toArray(),
            collection.findOne({ _id: parseInt(parameters.id) })
        ]);

        if (!organisme) {
            throw Boom.notFound('Identifiant inconnu');
        }

        res.json({
            avis: comment.map(c => createAvisDTO(c, { notes_decimales: parameters.notes_decimales })),
            meta: {
                pagination: createPaginationDTO(pagination, total)
            },
        });

    }));

    return router;
};
