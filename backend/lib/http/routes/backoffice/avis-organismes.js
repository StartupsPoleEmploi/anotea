const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const Boom = require('boom');
const { tryAndCatch, getRemoteAddress } = require('../routes-utils');

module.exports = ({ db, logger, createJWTAuthMiddleware, checkProfile }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = createJWTAuthMiddleware('backoffice');

    const saveEvent = (id, type, source) => {
        db.collection('events').save({ adviceId: id, date: new Date(), type: type, source: source });
    };

    router.post('/backoffice/advice/:id/answer', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

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

    router.delete('/backoffice/advice/:id/answer', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

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

    router.put('/backoffice/avis/:id/markAsNotRead', checkAuth, checkProfile('organisme'), tryAndCatch((req, res) => {
        const id = ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { read: false } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'markAsNotRead', {
                        app: 'organisation',
                        user: req.query.userId,
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.put('/backoffice/avis/:id/report', checkAuth, checkProfile('organisme'), tryAndCatch((req, res) => {
        const id = ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { reported: true } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'report', {
                        app: 'organisation',
                        user: req.query.userId,
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.put('/backoffice/avis/:id/unreport', checkAuth, checkProfile('organisme'), tryAndCatch((req, res) => {
        const id = ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { reported: false, read: true } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'report', {
                        app: 'organisation',
                        user: req.query.userId,
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    return router;
};
