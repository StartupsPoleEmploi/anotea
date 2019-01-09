const express = require('express');
const Boom = require('boom');
const Joi = require('joi');
const tryAndCatch = require('../tryAndCatch');

module.exports = ({ db, mailing, createJWTAuthMiddleware, checkProfile }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let { sendOrganisationAccountEmail, sendForgottenPasswordEmail } = mailing;

    const getRemoteAddress = req => req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const saveEvent = (id, type, source) => {
        db.collection('events').insertOne({ organisationId: id, date: new Date(), type: type, source: source });
    };

    router.post('/backoffice/organisation/:id/editedCourriel', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let parameters = await Joi.validate(req.body, {
            email: Joi.string().email().required(),
        }, { abortEarly: false });

        let id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw Boom.badRequest('Bad request');
        }

        let organisme = await db.collection('organismes').findOne({ _id: id });
        if (organisme) {
            await db.collection('organismes').update({ _id: id }, { $set: { editedCourriel: parameters.email } });
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

    router.delete('/backoffice/organisation/:id/editedCourriel', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            throw Boom.badRequest('Bad request');
        }

        let organisme = await db.collection('organismes').findOne({ _id: id });
        if (organisme) {
            await db.collection('organismes').update({ _id: id }, { $unset: { editedCourriel: '' } });
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

    router.post('/backoffice/organisation/:id/resendEmailAccount', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        const id = parseInt(req.params.id);

        const organismes = db.collection('organismes');

        if (isNaN(id)) {
            throw Boom.badRequest('Bad request');
        }

        let organisme = await organismes.findOne({ _id: id });
        if (organisme) {
            if (organisme.passwordHash) {
                await sendForgottenPasswordEmail(organisme);
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
