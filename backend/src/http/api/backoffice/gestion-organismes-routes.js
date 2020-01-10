const express = require('express');
const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const { IdNotFoundError } = require('../../../core/errors');
const { tryAndCatch, getRemoteAddress, sendArrayAsJsonStream, sendCSVStream } = require('../../utils/routes-utils');

module.exports = ({ db, configuration, emails, middlewares, logger }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let itemsPerPage = configuration.api.pagination;

    const convertOrganismeToDTO = organisme => {
        organisme.status = organisme.passwordHash ? 'active' : 'inactive';
        return _.omit(organisme, ['passwordHash', 'token']);
    };

    const saveEvent = (id, type, source) => {
        db.collection('events').insertOne({ organisationId: id, date: new Date(), type: type, source: source });
    };

    router.get('/api/backoffice/moderateur/organismes', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { status, search, page } = await Joi.validate(req.query, {
            status: Joi.string().allow(['all', 'active', 'inactive']).default('all'),
            search: Joi.string(),
            page: Joi.number().min(0).default(0),
        }, { abortEarly: false });

        let cursor = db.collection('accounts')
        .find({
            profile: 'organisme',
            codeRegion: codeRegion,
            ...(search ? {
                $or: [
                    { 'meta.siretAsString': search },
                    { 'courriel': search },
                    { 'raisonSociale': new RegExp(search, 'i') }]
            } : {}),
            ...(status === 'all' ? {} : { passwordHash: { $exists: status === 'active' } }),
        })
        //.sort({ updateDate: -1 })
        .skip((page || 0) * itemsPerPage)
        .limit(itemsPerPage);

        let [total, itemsOnThisPage] = await Promise.all([
            cursor.count(),
            cursor.count(true),
        ]);

        let stream = cursor.transformStream({
            transform: o => convertOrganismeToDTO(o),
        });

        return sendArrayAsJsonStream(stream, res, {
            arrayPropertyName: 'organismes',
            arrayWrapper: {
                meta: {
                    pagination: {
                        page,
                        itemsPerPage,
                        itemsOnThisPage,
                        totalItems: total,
                        totalPages: Math.ceil(total / itemsPerPage),
                    },
                }
            }
        });
    }));

    router.get('/api/backoffice/moderateur/export/organismes.csv', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { status } = await Joi.validate(req.query, {
            status: Joi.string().allow(['all', 'active', 'inactive']).default('all'),
            token: Joi.string().required(),
        }, { abortEarly: false });

        let stream = await db.collection('accounts').find({
            profile: 'organisme',
            codeRegion: codeRegion,
            ...(status === 'all' ? {} : { passwordHash: { $exists: status === 'active' } }),
        }, { token: 0 }).stream();

        let isKairos = organisme => {
            let kairos = organisme.sources.find(s => s === 'kairos');
            return kairos === 'kairos' ? 'oui' : 'non';
        };

        try {
            await sendCSVStream(stream, res, {
                'Siret': organisme => organisme.meta.siretAsString,
                'Nom': organisme => organisme.raisonSociale,
                'Email': organisme => organisme.courriel,
                'Nombre d\'Avis': organisme => organisme.score.nb_avis,
                'Kairos': organisme => isKairos(organisme),
                'Lieux de formation': organisme => {
                    return organisme.lieux_de_formation.map(l => `${l.adresse.code_postal}/${l.adresse.ville}`).join(',');
                },
            }, { encoding: 'UTF-16BE', filename: 'organismes.csv' });
        } catch (e) {
            //FIXME we must handle errors
            logger.error('Unable to send CSV file', e);
        }

    }));

    router.put('/api/backoffice/moderateur/organismes/:id/updateCourriel', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let { id } = await Joi.validate(req.params, { id: Joi.number().integer().required() }, { abortEarly: false });
        let { courriel } = await Joi.validate(req.body, { courriel: Joi.string().email().required() }, { abortEarly: false });

        let result = await db.collection('accounts').findOneAndUpdate(
            { _id: id },
            { $set: { courriel } },
            { returnOriginal: false }
        );

        if (!result.value) {
            throw new IdNotFoundError(`Avis with identifier ${id} not found`);
        }

        saveEvent(id, 'editEmail', {
            app: 'moderation',
            profile: 'moderateur',
            user: 'admin',
            ip: getRemoteAddress(req)
        });
        return res.status(201).send(result.value);
    }));

    router.post('/api/backoffice/moderateur/organismes/:id/resendEmailAccount', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let { id } = await Joi.validate(req.params, { id: Joi.number().integer().required() }, { abortEarly: false });

        let organisme = await db.collection('accounts').findOne({ _id: id, profile: 'organisme' });
        if (organisme) {
            let templateName = organisme.passwordHash ? 'forgottenPasswordEmail' : 'activationCompteEmail';
            let message = emails.getEmailMessageByTemplateName(templateName);
            await message.send(organisme);

            return res.json({ 'status': 'OK' });

        } else {
            throw Boom.notFound('Not found');
        }
    }));

    return router;
};
