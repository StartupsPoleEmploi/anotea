const express = require('express');
const Boom = require('boom');
const tryAndCatch = require('../tryAndCatch');

module.exports = ({ db, authService, sendOrganisationAccountEmail, sendForgottenPasswordEmail }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = authService.createJWTAuthMiddleware('backoffice');

    const getRemoteAddress = req => req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const saveEvent = (id, type, source) => {
        db.collection('events').save({ organisationId: id, date: new Date(), type: type, source: source });
    };

    router.post('/backoffice/organisation/:id/editedCourriel', checkAuth, tryAndCatch(async (req, res) => {
        const email = req.body.email;
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            throw Boom.badRequest('Bad request');
        }

        let organisme = await db.collection('organismes').findOne({ _id: id });
        if (organisme) {
            await db.collection('organismes').update({ _id: id }, { $set: { editedCourriel: email } });
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

    router.delete('/backoffice/organisation/:id/editedCourriel', checkAuth, tryAndCatch(async (req, res) => {
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

    router.post('/backoffice/organisation/:id/resendEmailAccount', checkAuth, tryAndCatch(async (req, res) => {
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
