const express = require('express');
const _ = require('lodash');
const Boom = require('boom');
const Joi = require('joi');
const { tryAndCatch, getRemoteAddress } = require('../../routes-utils');
const getOrganismeEmail = require('../../../../common/utils/getOrganismeEmail');

module.exports = ({ db, configuration, mailing, middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let { sendOrganisationAccountEmail, sendForgottenPasswordEmail } = mailing;
    let itemsPerPage = configuration.api.pagination;

    const saveEvent = (id, type, source) => {
        db.collection('events').insertOne({ organisationId: id, date: new Date(), type: type, source: source });
    };

    router.get('/backoffice/moderateur/organismes', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { status, siret, page } = await Joi.validate(req.query, {
            status: Joi.string().allow(['actif', 'inactif']),
            siret: Joi.string(),
            page: Joi.number().min(0).default(0),
        }, { abortEarly: false });

        let cursor = db.collection('accounts')
        .find({
            profile: 'organisme',
            codeRegion: codeRegion,
            ...(siret ? { 'meta.siretAsString': siret } : {}),
            ...(status ? { passwordHash: { $exists: status === 'actif' } } : {}),
        })
        //.sort({ updateDate: -1 })
        .skip((page || 0) * itemsPerPage)
        .limit(itemsPerPage);

        let [total, organismes] = await Promise.all([
            cursor.count(),
            cursor.toArray(),
        ]);

        res.send({
            organismes: organismes.map(o => _.omit(o, ['passwordHash', 'token'])),
            meta: {
                pagination: {
                    page: page,
                    itemsPerPage,
                    itemsOnThisPage: organismes.length,
                    totalItems: total,
                    totalPages: Math.ceil(total / itemsPerPage),
                },
            }
        });
    }));

    router.post('/backoffice/moderateur/organismes/:id/editedCourriel', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let { id } = await Joi.validate(req.params, { id: Joi.number().integer().required() }, { abortEarly: false });
        let parameters = await Joi.validate(req.body, {
            email: Joi.string().email().required(),
        }, { abortEarly: false });

        let organisme = await db.collection('accounts').findOne({ _id: id });
        if (organisme) {
            await db.collection('accounts').updateOne({ _id: id }, { $set: { editedCourriel: parameters.email } });
            saveEvent(id, 'editEmail', {
                app: 'moderation',
                profile: 'moderateur',
                user: 'admin',
                ip: getRemoteAddress(req)
            });
            res.status(201).send({ 'status': 'OK' });
        } else {
            throw Boom.notFound('Not found');
        }
    }));

    router.delete('/backoffice/moderateur/organismes/:id/editedCourriel', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let { id } = await Joi.validate(req.params, { id: Joi.number().integer().required() }, { abortEarly: false });

        let organisme = await db.collection('accounts').findOne({ _id: id });
        if (organisme) {
            await db.collection('accounts').updateOne({ _id: id }, { $unset: { editedCourriel: '' } });
            saveEvent(id, 'deleteEmail', {
                app: 'moderation',
                profile: 'moderateur',
                user: 'admin',
                ip: getRemoteAddress(req)
            });
            res.status(200).send({ 'status': 'OK' });
        } else {
            throw Boom.notFound('Not found');
        }
    }));

    router.post('/backoffice/moderateur/organismes/:id/resendEmailAccount', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let { id } = await Joi.validate(req.params, { id: Joi.number().integer().required() }, { abortEarly: false });

        let organisme = await db.collection('accounts').findOne({ _id: id, profile: 'organisme' });
        if (organisme) {
            if (organisme.passwordHash) {
                await sendForgottenPasswordEmail(organisme._id, getOrganismeEmail(organisme), organisme.codeRegion);
            } else {
                await sendOrganisationAccountEmail(organisme, { ip: getRemoteAddress(req) });
            }

            res.status(200).send({ 'status': 'OK' });

        } else {
            throw Boom.notFound('Not found');
        }
    }));

    return router;
};
