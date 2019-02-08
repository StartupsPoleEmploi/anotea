const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const { tryAndCatch, getRemoteAddress } = require('../routes-utils');
const { IdNotFoundError } = require('./../../../common/errors');
const { objectId } = require('./../../../common/validators');

module.exports = ({ db, logger, middlewares, moderation }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    const checkAuth = createJWTAuthMiddleware('backoffice');

    const saveEvent = (id, type, source) => {
        db.collection('events').save({ adviceId: id, date: new Date(), type: type, source: source });
    };

    router.put('/backoffice/avis/:id/answer', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { answer: text } = await Joi.validate(req.body, { answer: Joi.string().required() }, { abortEarly: false });

        let result = await db.collection('comment').findOneAndUpdate(
            { _id: new ObjectID(id) },
            {
                $set: {
                    answer: {
                        text: text,
                        date: new Date(),
                        status: 'published', //TODO set to published for the moment
                    },
                    read: true,
                }
            },
            { returnOriginal: false }
        );

        if (!result.value) {
            throw new IdNotFoundError(`Avis with identifier ${id} not found`);
        }

        saveEvent(id, 'answer', {
            app: 'organisation',
            user: req.query.userId,
            ip: getRemoteAddress(req),
            answer: text
        });
        return res.json(result.value);
    }));

    router.delete('/backoffice/avis/:id/answer', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let result = await db.collection('comment').findOneAndUpdate(
            { _id: new ObjectID(id) },
            { $unset: { answer: '' } },
            { returnOriginal: false }
        );

        if (!result.value) {
            throw new IdNotFoundError(`Avis with identifier ${id} not found`);
        }

        saveEvent(id, 'answer removed', {
            app: 'organisation',
            user: req.query.userId,
            ip: getRemoteAddress(req)
        });

        res.json(result);

    }));


    router.put('/backoffice/avis/:id/markAsRead', checkAuth, checkProfile('organisme'), tryAndCatch((req, res) => {
        const id = ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { read: true } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'markAsRead', {
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

    router.put('/backoffice/avis/:id/report', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: Joi.string().required() }, { abortEarly: false });

        let avis = await moderation.report(id, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
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
