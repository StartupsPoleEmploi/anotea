const Joi = require('joi');
const express = require('express');
const Boom = require('boom');
const ObjectID = require('mongodb').ObjectID;
const { IdNotFoundError } = require('../../../../common/errors');
const getAvisCSV = require('./utils/getAvisCSV');
const { tryAndCatch, sendArrayAsJsonStream, sendCSVStream } = require('../../routes-utils');
const { objectId } = require('../../validators-utils');
const getProfile = require('./profiles/getProfile');

module.exports = ({ db, middlewares, configuration, logger, workflow, mailing, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let itemsPerPage = configuration.api.pagination;

    router.get('/backoffice/avis', checkAuth, tryAndCatch(async (req, res) => {

        let { validators, queries } = getProfile(db, regions, req.user);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(),
            ...validators.filters(),
            ...validators.pagination(),
        }, { abortEarly: false });

        let query = await queries.buildAvisQuery(parameters);
        let cursor = db.collection('comment')
        .find(query)
        .sort({ [parameters.sortBy || 'date']: -1 })
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

        let { validators, queries } = getProfile(db, regions, req.user);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(),
            ...validators.filters(),
            token: Joi.string(),
        }, { abortEarly: false });

        let stream = db.collection('comment')
        .find({
            ...await queries.buildAvisQuery(parameters),
        })
        .sort({ [parameters.sortBy || 'date']: -1 })
        .stream();

        try {
            await sendCSVStream(stream, res, getAvisCSV(req.user.profile), { encoding: 'UTF-16BE', filename: 'avis.csv' });
        } catch (e) {
            //FIXME we must handle errors
            logger.error('Unable to send CSV file', e);
        }
    }));

    router.put('/backoffice/avis/:id/pseudo', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { mask } = await Joi.validate(req.body, { mask: Joi.boolean().required() }, { abortEarly: false });

        let avis = await workflow.maskPseudo(id, mask, { profile });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/title', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { mask } = await Joi.validate(req.body, { mask: Joi.boolean().required() }, { abortEarly: false });

        let avis = await workflow.maskTitle(id, mask, { profile });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/reject', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let { sendInjureMail, sendAlerteMail, sendSignalementAccepteNotification } = mailing;

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { qualification } = await Joi.validate(req.body, {
            qualification: Joi.string().required()
        }, { abortEarly: false });

        let previous = await db.collection('comment').findOne({ _id: new ObjectID(id) });

        let updated = await workflow.reject(id, qualification, { profile });
        //TODO move into workflow.js
        if (previous) {
            if (previous.status === 'reported') {
                sendSignalementAccepteNotification(previous._id)
                .catch(e => logger.error(e, 'Unable to send email'));
            }
        } else {
            throw new IdNotFoundError(`Avis with identifier ${id} not found`);
        }

        if (qualification === 'injure' || qualification === 'alerte') {
            let comment = await db.collection('comment').findOne({ _id: new ObjectID(id) });
            let trainee = await db.collection('trainee').findOne({ token: comment.token });

            let email = trainee.trainee.email;
            let sendMail;

            if (qualification === 'injure') {
                sendMail = sendInjureMail;
            } else if (qualification === 'alerte') {
                sendMail = sendAlerteMail;
            }

            sendMail(email, trainee, comment, qualification)
            .catch(e => logger.error(e, 'Unable to send email'));
        }

        return res.json(updated);
    }));

    router.delete('/backoffice/avis/:id', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        await workflow.delete(id, { profile });

        return res.json({ 'message': 'avis deleted' });
    }));

    router.put('/backoffice/avis/:id/publish', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { qualification } = await Joi.validate(req.body, { qualification: Joi.string().required() }, { abortEarly: false });

        let previous = await db.collection('comment').findOne({ _id: new ObjectID(id) });

        let updated = await workflow.publish(id, qualification, { profile });
        if (previous) {
            //TODO move into workflow.js
            if (previous.status === 'reported') {
                mailing.sendSignalementRejeteNotification(previous._id)
                .catch(e => logger.error(e, 'Unable to send email'));
            }
        } else {
            throw new IdNotFoundError(`Avis with identifier ${id} not found`);
        }

        return res.json(updated);
    }));

    router.put('/backoffice/avis/:id/edit', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { text } = await Joi.validate(req.body, { text: Joi.string().required() }, { abortEarly: false });
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await workflow.edit(id, text, { profile });

        return res.json(avis);

    }));

    router.put('/backoffice/avis/:id/publishReponse', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await workflow.publishReponse(id, { profile });

        return res.json(avis);

    }));

    router.put('/backoffice/avis/:id/rejectReponse', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await workflow.rejectReponse(id, { profile });

        //TODO move into workflow
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

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { text } = await Joi.validate(req.body, { text: Joi.string().required() }, { abortEarly: false });

        let avis = await workflow.addReponse(id, text, { profile });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/removeReponse', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await workflow.removeReponse(id, { profile });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/read', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { read } = await Joi.validate(req.body, { read: Joi.boolean().required() }, { abortEarly: false });

        let avis = await workflow.markAsRead(id, read, { profile });

        return res.json(avis);
    }));

    router.put('/backoffice/avis/:id/report', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: Joi.string().required() }, { abortEarly: false });
        let { report } = await Joi.validate(req.body, { report: Joi.boolean().required() }, { abortEarly: false });

        let avis = await workflow.report(id, report, { profile });

        return res.json(avis);

    }));

    return router;
};
