const express = require('express');
const mongo = require('mongodb');
const Joi = require('joi');
const Boom = require('boom');
const ObjectID = require('mongodb').ObjectID;
const { tryAndCatch, getRemoteAddress } = require('../routes-utils');
const computeInventory = require('./utils/computeInventory');

module.exports = ({ db, middlewares, logger, configuration, moderation, mailing }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    const checkAuth = createJWTAuthMiddleware('backoffice');
    const itemsPerPage = configuration.api.pagination;

    const saveEvent = function(id, type, source) {
        db.collection('events').save({ adviceId: id, date: new Date(), type: type, source: source });
    };

    router.get('/backoffice/avis', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { filter, query, page } = await Joi.validate(req.query, {
            filter: Joi.string().default('all'),
            query: Joi.string().allow('').default(''),
            page: Joi.number().default(0),
        }, { abortEarly: false });

        let cursor = db.collection('comment')
        .find({
            step: { $gte: 2 },
            codeRegion: codeRegion,
            ...(filter !== 'all' ? { comment: { $ne: null } } : {}),
            ...(filter === 'reported' ? { reported: true } : {}),
            ...(filter === 'rejected' ? { rejected: true } : {}),
            ...(filter === 'published' ? { published: true } : {}),
            ...(filter === 'moderated' ? { moderated: { $ne: true } } : {}),
        })
        .sort(filter === 'all' ? { date: -1 } : { lastModerationAction: -1 })
        .skip((page || 0) * itemsPerPage)
        .limit(itemsPerPage);

        let [total, avis, inventory] = await Promise.all([
            cursor.count(),
            cursor.toArray(),
            computeInventory(db, codeRegion),
        ]);

        res.send({
            avis: avis,
            meta: {
                inventory,
                pagination: {
                    page: page,
                    itemsPerPage,
                    itemsOnThisPage: avis.length,
                    totalItems: total,
                    totalPages: Math.ceil(total / itemsPerPage),
                }
            }
        });
    }));

    router.put('/backoffice/avis/:id/maskPseudo', checkAuth, checkProfile('moderateur'), tryAndCatch((req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap

        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { pseudoMasked: true } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'maskPseudo', {
                        app: 'moderation',
                        profile: 'moderateur',
                        user: req.query.userId,
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.put('/backoffice/avis/:id/unmaskPseudo', checkAuth, checkProfile('moderateur'), tryAndCatch((req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { pseudoMasked: false } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'maskPseudo', {
                        app: 'moderation',
                        profile: 'moderateur',
                        user: req.query.userId,
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.put('/backoffice/avis/:id/maskTitle', checkAuth, checkProfile('moderateur'), tryAndCatch((req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { titleMasked: true } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'maskTitle', {
                        app: 'moderation',
                        profile: 'moderateur',
                        user: req.query.userId,
                        ip: req.connection.remoteAddress
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.put('/backoffice/avis/:id/unmaskTitle', checkAuth, checkProfile('moderateur'), tryAndCatch((req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { titleMasked: false } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'maskTitle', {
                        app: 'moderation',
                        profile: 'moderateur',
                        user: req.query.userId,
                        ip: req.connection.remoteAddress
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.put('/backoffice/avis/:id/reject', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: Joi.string().required() }, { abortEarly: false });
        const { reason } = await Joi.validate(req.body, { reason: Joi.string().required() }, { abortEarly: false });

        let avis = await moderation.reject(id, reason, { sendEmail: true, event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    }));

    router.delete('/backoffice/avis/:id', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: Joi.string().required() }, { abortEarly: false });

        await moderation.delete(id, { event: { origin: getRemoteAddress(req) } });

        return res.json({ 'message': 'avis deleted' });
    }));

    router.put('/backoffice/avis/:id/publish', checkAuth, checkProfile('moderateur'), async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: Joi.string().required() }, { abortEarly: false });
        const { qualification } = await Joi.validate(req.body, { qualification: Joi.string().required() }, { abortEarly: false });

        let avis = await moderation.publish(id, qualification, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    });

    router.put('/backoffice/avis/:id/edit', checkAuth, checkProfile('moderateur'), async (req, res) => {

        const { text } = await Joi.validate(req.body, { text: Joi.string().required() }, { abortEarly: false });
        const { id } = await Joi.validate(req.params, { id: Joi.string().required() }, { abortEarly: false });

        let avis = await moderation.edit(id, text, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);

    });

    router.put('/backoffice/avis/:id/resendEmail', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let { sendVotreAvisEmail } = mailing;

        const parameters = await Joi.validate(req.params, {
            id: Joi.string().required(),
        }, { abortEarly: false });

        if (!ObjectID.isValid(parameters.id)) {
            throw Boom.badRequest('Identifiant invalide');
        }

        let advice = await db.collection('comment').findOne({ _id: new ObjectID(parameters.id) });

        if (!advice) {
            throw Boom.notFound('Identifiant inconnu');
        }

        let trainee = await db.collection('trainee').findOne({ token: advice.token });

        if (!trainee) {
            throw Boom.notFound('Stagiaire introuvable');
        }

        await sendVotreAvisEmail(trainee);
        await db.collection('comment').removeOne({ _id: new ObjectID(parameters.id) });


        res.json({ 'message': 'trainee email resent' });
    }));

    return router;
};
