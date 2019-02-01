const express = require('express');
const mongo = require('mongodb');
const Joi = require('joi');
const Boom = require('boom');
const ObjectID = require('mongodb').ObjectID;
const { tryAndCatch, getRemoteAddress } = require('../routes-utils');
const AvisSearchBuilder = require('./utils/AvisSearchBuilder');
const computeInventory = require('./utils/computeInventory');

module.exports = ({ db, middlewares, logger, configuration, mailer, mailing }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    const checkAuth = createJWTAuthMiddleware('backoffice');
    const itemsPerPage = configuration.api.pagination;

    const saveEvent = function(id, type, source) {
        db.collection('events').save({ adviceId: id, date: new Date(), type: type, source: source });
    };

    const sendInjureEmailAsync = (trainee, comment, reason) => {
        let email = trainee.trainee.email;
        mailer.sendInjureMail({ to: email }, trainee, comment, () => {
            logger.info(`email sent to ${email} pour`, reason);
        }, err => {
            logger.error(`Unable to send email to ${email}`, err);
        });
    };

    router.get('/backoffice/avis', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { filter, query, page } = await Joi.validate(req.query, {
            filter: Joi.string().default('all'),
            query: Joi.string().allow('').default(''),
            page: Joi.number().default(0),
        }, { abortEarly: false });


        let builder = new AvisSearchBuilder(db, itemsPerPage, codeRegion);

        if (query) {
            let isEmail = query.indexOf('@') !== -1;
            await (isEmail ? builder.withEmail(query) : builder.withFullText(query));
        }
        builder.withFilter(filter);
        builder.page(page);

        let cursor = builder.search();
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
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        const rejectReason = req.body.reason;
        let comment = await db.collection('comment').findOne({ _id: id });
        let trainee = await db.collection('trainee').findOne({ token: comment.token });

        db.collection('comment').findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    reported: false,
                    moderated: true,
                    rejected: true,
                    published: false,
                    rejectReason: req.body.reason,
                    lastModerationAction: new Date()
                }
            },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {

                    if (rejectReason === 'injure') {
                        sendInjureEmailAsync(trainee, comment, rejectReason);
                    }

                    saveEvent(id, 'reject', {
                        app: 'moderation',
                        user: 'admin',
                        profile: 'moderateur',
                        ip: getRemoteAddress(req)
                    });

                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.delete('/backoffice/avis/:id', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap

        db.collection('comment').removeOne({ _id: id }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'delete', {
                    app: 'moderation',
                    profile: 'moderateur',
                    user: req.query.userId,
                    ip: req.connection.remoteAddress
                });
                res.status(200).send({ 'message': 'advice deleted' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    }));

    router.post('/backoffice/avis/:id/publish', checkAuth, checkProfile('moderateur'), (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap

        db.collection('comment').findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    reported: false,
                    moderated: true,
                    published: true,
                    rejected: false,
                    rejectReason: null,
                    qualification: req.body.qualification,
                    lastModerationAction: new Date()
                }
            },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'publish', {
                        app: 'moderation',
                        user: 'admin',
                        profile: 'moderateur',
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    });

    router.put('/backoffice/avis/:id/edit', checkAuth, checkProfile('moderateur'), (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap

        db.collection('comment').findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    'editedComment': { text: req.body.text, date: new Date() },
                    'lastModerationAction': new Date()
                }
            },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'publish', {
                        app: 'moderation',
                        user: 'admin',
                        profile: 'moderateur',
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
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
