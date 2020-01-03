const Joi = require('joi');
const express = require('express');
const getAvisCSV = require('./utils/getAvisCSV');
const { tryAndCatch, sendArrayAsJsonStream, sendCSVStream } = require('../../utils/routes-utils');
const { objectId } = require('../../utils/validators-utils');
const getProfile = require('./profiles/getProfile');

module.exports = ({ db, middlewares, configuration, logger, workflow, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let itemsPerPage = configuration.api.pagination;

    router.get('/api/backoffice/avis', checkAuth, tryAndCatch(async (req, res) => {

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

    router.get('/api/backoffice/avis.csv', checkAuth, tryAndCatch(async (req, res) => {

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

    router.put('/api/backoffice/avis/:id/pseudo', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { mask } = await Joi.validate(req.body, { mask: Joi.boolean().required() }, { abortEarly: false });

        let avis = await workflow.maskPseudo(id, mask, { profile });

        return res.json(avis);
    }));

    router.put('/api/backoffice/avis/:id/title', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { mask } = await Joi.validate(req.body, { mask: Joi.boolean().required() }, { abortEarly: false });

        let avis = await workflow.maskTitle(id, mask, { profile });

        return res.json(avis);
    }));

    router.put('/api/backoffice/avis/:id/reject', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { qualification } = await Joi.validate(req.body, {
            qualification: Joi.string().required()
        }, { abortEarly: false });

        let updated = await workflow.reject(id, qualification, { profile, sendEmail: true });

        return res.json(updated);
    }));

    router.delete('/api/backoffice/avis/:id', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id, sendEmail } = await Joi.validate(Object.assign({}, req.query, req.params), {
            id: objectId().required(),
            sendEmail: Joi.boolean().default(false),
        }, { abortEarly: false });

        await workflow.delete(id, { profile, sendEmail });

        return res.json({ 'message': 'avis deleted' });
    }));

    router.put('/api/backoffice/avis/:id/validate', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { qualification } = await Joi.validate(req.body, { qualification: Joi.string().required() }, { abortEarly: false });

        let updated = await workflow.validate(id, qualification, { profile, sendEmail: true });

        return res.json(updated);
    }));

    router.put('/api/backoffice/avis/:id/edit', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { text } = await Joi.validate(req.body, { text: Joi.string().required() }, { abortEarly: false });
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await workflow.edit(id, text, { profile });

        return res.json(avis);

    }));

    router.put('/api/backoffice/avis/:id/validateReponse', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await workflow.validateReponse(id, { profile });

        return res.json(avis);

    }));

    router.put('/api/backoffice/avis/:id/rejectReponse', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await workflow.rejectReponse(id, { profile, sendEmail: true });

        return res.json(avis);

    }));

    router.put('/api/backoffice/avis/:id/addReponse', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { text } = await Joi.validate(req.body, { text: Joi.string().max(300).required() }, { abortEarly: false });

        let avis = await workflow.addReponse(id, text, { profile });

        return res.json(avis);
    }));

    router.put('/api/backoffice/avis/:id/removeReponse', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await workflow.removeReponse(id, { profile });

        return res.json(avis);
    }));

    router.put('/api/backoffice/avis/:id/read', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        let { read } = await Joi.validate(req.body, { read: Joi.boolean().required() }, { abortEarly: false });

        let avis = await workflow.markAsRead(id, read, { profile });

        return res.json(avis);
    }));

    router.put('/api/backoffice/avis/:id/report', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = await Joi.validate(req.params, { id: Joi.string().required() }, { abortEarly: false });
        let { report } = await Joi.validate(req.body, { report: Joi.boolean().required() }, { abortEarly: false });

        let avis = await workflow.report(id, report, { profile });

        return res.json(avis);

    }));

    return router;
};
