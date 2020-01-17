const express = require('express');
const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../utils/routes-utils');
const validators = require('./utils/validators');
const buildProjection = require('./utils/buildProjection');
const buildSort = require('./utils/buildSort');
const { createOrganismeFomateurDTO, createPaginationDTO, createAvisDTO } = require('./utils/dto');
const schema = require('./utils/schema');

module.exports = ({ db, middlewares }) => {

    let router = express.Router();// eslint-disable-line new-cap
    let { createHMACAuthMiddleware } = middlewares;
    let checkAuth = createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: true });

    router.get('/api/v1/organismes-formateurs', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            ...validators.pagination(),
            id: validators.arrayOf(Joi.string()),
            numero: validators.arrayOf(Joi.string()),
            siret: validators.arrayOf(Joi.string()),
            lieu_de_formation: validators.arrayOf(Joi.string()),
            nb_avis: Joi.number(),
            ...validators.fields(),
            ...validators.pagination(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        let pagination = _.pick(parameters, ['page', 'items_par_page']);
        let limit = pagination.items_par_page;
        let skip = pagination.page * limit;
        let query = {
            ...(parameters.id ? { '_id': { $in: parameters.id.map(id => parseInt(id)) } } : {}),
            ...(parameters.numero ? { 'numero': { $in: parameters.numero } } : {}),
            ...(parameters.siret ? { 'siret': { $in: parameters.siret } } : {}),
            ...(parameters.nb_avis ? { 'score.nb_avis': { $gte: parameters.nb_avis } } : {}),
            ...(parameters.lieu_de_formation ? {
                $or: [
                    { 'lieux_de_formation.adresse.code_postal': { $in: parameters.lieu_de_formation } },
                    { 'lieux_de_formation.adresse.region': { $in: parameters.lieu_de_formation } }
                ]
            } : {}),
        };

        let organismes = await db.collection('accounts').find(query)
        .project(buildProjection(parameters.fields))
        .limit(limit)
        .skip(skip);

        let total = await organismes.count();
        let stream = organismes.transformStream({
            transform: organisme => createOrganismeFomateurDTO(organisme, { notes_decimales: parameters.notes_decimales })
        });

        return sendArrayAsJsonStream(stream, res, {
            arrayPropertyName: 'organismes_formateurs',
            arrayWrapper: {
                meta: {
                    pagination: createPaginationDTO(pagination, total)
                },
            }
        });
    }));

    router.get('/api/v1/organismes-formateurs/:id', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...validators.fields(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        let organisme = await db.collection('accounts').findOne(
            { _id: parseInt(parameters.id) },
            { projection: buildProjection(parameters.fields) },
        );

        if (!organisme) {
            throw Boom.notFound('Identifiant inconnu');
        }

        if (req.headers.accept === 'application/ld+json') {
            res.json(schema.toOrganization(organisme));
        } else {
            let dto = createOrganismeFomateurDTO(organisme, { notes_decimales: parameters.notes_decimales });
            res.json(dto);
        }
    }));

    router.get('/api/v1/organismes-formateurs/:id/avis', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...validators.pagination(),
            ...validators.notesDecimales(),
            ...validators.commentaires(),
            ...validators.tri(),
        }, { abortEarly: false });

        let pagination = _.pick(parameters, ['page', 'items_par_page']);
        let limit = pagination.items_par_page;
        let skip = pagination.page * limit;

        let organisme = await db.collection('accounts').findOne({ _id: parseInt(parameters.id) });

        if (!organisme) {
            throw Boom.notFound('Identifiant inconnu');
        }

        let avis = await db.collection('avis')
        .find({
            'training.organisation.siret': organisme.siret,
            ...(
                parameters.commentaires === null ?
                    { status: { $in: ['validated', 'rejected'] } } :
                    {
                        $or: [
                            { comment: { $exists: parameters.commentaires }, status: 'validated' },
                            { 'reponse.status': 'validated', 'status': 'validated' },
                        ]

                    }
            )
        })
        .sort(buildSort(_.pick(parameters, ['tri', 'ordre'])))
        .limit(limit)
        .skip(skip);

        let total = await avis.count();
        let stream = avis.transformStream({
            transform: avis => createAvisDTO(avis, { notes_decimales: parameters.notes_decimales })
        });

        return sendArrayAsJsonStream(stream, res, {
            arrayPropertyName: 'avis',
            arrayWrapper: {
                meta: {
                    pagination: createPaginationDTO(pagination, total)
                },
            }
        });
    }));

    return router;
};
