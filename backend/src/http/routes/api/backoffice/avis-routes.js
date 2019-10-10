const Joi = require('joi');
const express = require('express');
const Boom = require('boom');
const ObjectID = require('mongodb').ObjectID;
const { IdNotFoundError } = require('../../../../common/errors');
const getAvisCSV = require('./utils/getAvisCSV');
const { tryAndCatch, getRemoteAddress, sendArrayAsJsonStream, sendCSVStream } = require('../../routes-utils');
const { objectId } = require('../../validators-utils');
const getProfile = require('./profiles/getProfile');

module.exports = ({ db, middlewares, configuration, logger, moderation, consultation, mailing, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let itemsPerPage = configuration.api.pagination;

    router.get('/backoffice/avis', checkAuth, tryAndCatch(async (req, res) => {

        let user = req.user;
        let { validators, queries } = getProfile(db, regions, user);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(),
            ...validators.filters(),
            ...validators.pagination(),
        }, { abortEarly: false });

        let query = await queries.buildAvisQuery(parameters);
        let cursor = db.collection('comment')
        .find(query)
        .sort({ [parameters.sortBy]: -1 })
        .skip((parameters.page || 0) * itemsPerPage)
        .limit(itemsPerPage);

        let [total, itemsOnThisPage] = await Promise.all([
            cursor.count(),
            cursor.count(true),
        ]);

        return sendArrayAsJsonStream(cursor.stream(), res, {
            arrayPropertyName: 'avis',
            arrayWrapper: {
                meta: {
                    pagination: {
                        page: parameters.page,
                        itemsPerPage,
                        itemsOnThisPage,
                        totalItems: total,
                        totalPages: Math.ceil(total / itemsPerPage),
                    },
                }
            }
        });
    }));

    router.get('/backoffice/avis.csv', checkAuth, tryAndCatch(async (req, res) => {

        let user = req.user;
        let { validators, queries } = getProfile(db, regions, user);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(),
            ...validators.filters(),
            token: Joi.string(),
        }, { abortEarly: false });

        let stream = db.collection('comment')
        .find({
            ...await queries.buildAvisQuery(parameters),
        })
        .sort({ [parameters.sortBy]: -1 })
        .stream();

        try {
            await sendCSVStream(stream, res, getAvisCSV(), { encoding: 'UTF-16BE', filename: 'avis.csv' });
        } catch (e) {
            //FIXME we must handle errors
            logger.error('Unable to send CSV file', e);
        }
    }));

    router.put('/backoffice/avis/:id/pseudo', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { mask } = await Joi.validate(req.body, { mask: Joi.boolean().required() }, { abortEarly: false });

        let avis = await moderation.maskPseudo(id, mask, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/title', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { mask } = await Joi.validate(req.body, { mask: Joi.boolean().required() }, { abortEarly: false });

        let avis = await moderation.maskTitle(id, mask, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/reject', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let { sendInjureMail, sendAlerteMail, sendSignalementAccepteNotification } = mailing;

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { reason } = await Joi.validate(req.body, { reason: Joi.string().required() }, { abortEarly: false });

        let avis = await db.collection('comment').findOne({ _id: new ObjectID(id) });
        if (avis) {
            if (avis.reported) {
                sendSignalementAccepteNotification(avis._id)
                .catch(e => logger.error(e, 'Unable to send email'));
            }
        } else {
            throw new IdNotFoundError(`Avis with identifier ${id} not found`);
        }

        avis = await moderation.reject(id, reason, { event: { origin: getRemoteAddress(req) } });

        if (reason === 'injure' || reason === 'alerte') {
            let comment = await db.collection('comment').findOne({ _id: new ObjectID(id) });
            let trainee = await db.collection('trainee').findOne({ token: comment.token });

            let email = trainee.trainee.email;
            let sendMail;

            if (reason === 'injure') {
                sendMail = sendInjureMail;
            } else if (reason === 'alerte') {
                sendMail = sendAlerteMail;
            }

            sendMail(email, trainee, comment, reason)
            .catch(e => logger.error(e, 'Unable to send email'));
        }

        return res.json(avis);
    }));

    router.delete('/backoffice/avis/:id', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        await moderation.delete(id, { event: { origin: getRemoteAddress(req) } });

        return res.json({ 'message': 'avis deleted' });
    }));

    router.put('/backoffice/avis/:id/publish', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { qualification } = await Joi.validate(req.body, { qualification: Joi.string().required() }, { abortEarly: false });

        let avis = await db.collection('comment').findOne({ _id: new ObjectID(id) });
        if (avis) {
            if (avis.reported) {
                mailing.sendSignalementRejeteNotification(avis._id)
                .catch(e => logger.error(e, 'Unable to send email'));
            }
        } else {
            throw new IdNotFoundError(`Avis with identifier ${id} not found`);
        }

        avis = await moderation.publish(id, qualification, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/edit', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { text } = await Joi.validate(req.body, { text: Joi.string().required() }, { abortEarly: false });
        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await moderation.edit(id, text, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);

    }));

    router.put('/backoffice/avis/:id/publishReponse', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await moderation.publishReponse(id, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);

    }));

    router.put('/backoffice/avis/:id/rejectReponse', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await moderation.rejectReponse(id, { event: { origin: getRemoteAddress(req) } });

        mailing.sendReponseRejeteeNotification(avis._id)
        .catch(e => logger.error(e, 'Unable to send email'));

        return res.json(avis);

    }));

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

    router.put('/backoffice/avis/:id/addReponse', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { text } = await Joi.validate(req.body, { text: Joi.string().required() }, { abortEarly: false });

        let avis = await consultation.addReponse(id, text, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/removeReponse', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await consultation.removeReponse(id, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/read', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { read } = await Joi.validate(req.body, { read: Joi.boolean().required() }, { abortEarly: false });

        let avis = await consultation.markAsRead(id, read, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/report', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: Joi.string().required() }, { abortEarly: false });
        const { report } = await Joi.validate(req.body, { report: Joi.boolean().required() }, { abortEarly: false });

        let avis = await consultation.report(id, report, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);

    }));

    return router;
};
