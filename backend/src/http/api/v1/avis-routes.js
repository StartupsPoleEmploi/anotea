const express = require('express');
const Joi = require('joi');
const _ = require('lodash');
const Boom = require('boom');
const ObjectID = require('mongodb').ObjectID;
const { tryAndCatch, sendArrayAsJsonStream } = require('../../utils/routes-utils');
const validators = require('./utils/validators');
const { createPaginationDTO, createAvisDTO } = require('./utils/dto');
const buildSort = require('./utils/buildSort');

const buildAvisQuery = filters => {

    let queries = (filters.constructor === Array ? filters : [filters]).map(filter => {
        const FORMACODE_LENGTH = 5;
        let query = {};

        if (filter.organisme_formateur) {
            query['formation.action.organisme_formateur.siret'] = filter.organisme_formateur;
        }

        if (filter.lieu_de_formation) {
            query['formation.action.lieu_de_formation.code_postal'] = filter.lieu_de_formation;
        }

        if (filter.certif_info) {
            query['formation.certifications.certif_info'] = filter.certif_info;
        }

        if (filter.formacode) {
            let code = filter.formacode;
            query['formation.domaine_formation.formacodes'] = code.length < FORMACODE_LENGTH ? new RegExp(code) : code;
        }

        return query;
    });

    return {
        '$and': [
            queries.length === 0 ? {} : { '$or': queries },
            { 'status': { $in: ['validated', 'rejected'] } }
        ],
    };
};

module.exports = ({ db, middlewares }) => {

    let router = express.Router();// eslint-disable-line new-cap
    let { createHMACAuthMiddleware } = middlewares;
    let checkAuth = createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: true });

    router.get('/api/v1/avis', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            organisme_formateur: Joi.string().min(9).max(15),
            lieu_de_formation: Joi.string().regex(/^(([0-8][0-9])|(9[0-5])|(2[ab])|(97))[0-9]{3}$/),
            certif_info: Joi.string(),
            formacode: Joi.string(),
            ...validators.tri(),
            ...validators.pagination(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        let pagination = _.pick(parameters, ['page', 'items_par_page']);
        let filters = _.pick(parameters, ['organisme_formateur', 'lieu_de_formation', 'certif_info', 'formacode']);
        let limit = pagination.items_par_page;
        let skip = pagination.page * limit;
        let query = buildAvisQuery(filters);

        let avis = await db.collection('avis')
        .find(query)
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

    router.get('/api/v1/avis/:id', checkAuth, tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: Joi.string().required(),
            ...validators.notesDecimales(),
        }, { abortEarly: false });

        if (!ObjectID.isValid(parameters.id)) {
            throw Boom.badRequest('Identifiant invalide');
        }

        let avis = await db.collection('avis').findOne({ _id: new ObjectID(parameters.id) });

        if (!avis) {
            throw Boom.notFound('Identifiant inconnu');
        }
        res.json(createAvisDTO(avis, { notes_decimales: parameters.notes_decimales }));
    }));

    return router;
};
