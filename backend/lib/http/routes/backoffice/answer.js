const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const Boom = require('boom');
const { tryAndCatch, getRemoteAddress } = require('../routes-utils');

module.exports = ({ db, createJWTAuthMiddleware }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = createJWTAuthMiddleware('backoffice');

    const saveEvent = (id, type, source) => {
        db.collection('events').save({ adviceId: id, date: new Date(), type: type, source: source });
    };

    router.post('/backoffice/advice/:id/answer', checkAuth, tryAndCatch(async (req, res) => {

        if (!ObjectID.isValid(req.params.id)) {
            throw Boom.badRequest('Identifiant invalide');
        }

        let text = req.body.answer;
        const id = ObjectID(req.params.id); // eslint-disable-line new-cap

        let results = await db.collection('comment').update({ _id: id }, {
            $set: {
                answer: {
                    text: text,
                    status: 'published', //TODO set to published for the moment
                },
                read: true
            }
        });

        if (results.result.n === 1) {
            saveEvent(id, 'answer', {
                app: 'organisation',
                user: req.query.userId,
                ip: getRemoteAddress(req),
                answer: text
            });
            return res.json({ 'message': 'advice answered' });
        } else {
            throw Boom.notFound('Identifiant inconnu');
        }
    }));

    router.delete('/backoffice/advice/:id/answer', checkAuth, tryAndCatch(async (req, res) => {

        if (!ObjectID.isValid(req.params.id)) {
            throw Boom.badRequest('Identifiant invalide');
        }

        let id = ObjectID(req.params.id); // eslint-disable-line new-cap

        let results = await db.collection('comment').update({ _id: id }, { $unset: { answer: '' } });
        if (results.result.n === 1) {
            saveEvent(id, 'answer removed', {
                app: 'organisation',
                user: req.query.userId,
                ip: getRemoteAddress(req)
            });
            res.json({ 'message': 'advice answer removed' });
        } else {
            throw Boom.notFound('Identifiant inconnu');
        }
    }));

    return router;
};
