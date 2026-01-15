const Joi = require('joi');
const express = require('express');
const getAvisCSV = require('./utils/getAvisCSV');
const { tryAndCatch, sendArrayAsJsonStream, sendCSVStream } = require('../../utils/routes-utils');
const { idValidator } = require('../../utils/validators-utils');
const getProfile = require('./profiles/getProfile');
const getAvisStats = require('./utils/getAvisStats');

module.exports = ({ db, middlewares, configuration, logger, workflow, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let itemsPerPage = configuration.api.pagination;

    const idSchema = Joi.object({ id: idValidator().required() });
    const maskTitleSchema = Joi.object({ mask: Joi.boolean().required() });
    const changeTextSchema = Joi.object({ text: Joi.string().max(300).required() });
    const resendMailSchema = Joi.object({
        id: idValidator().required(),
        sendEmail: Joi.boolean().default(false),
    });
    const responseTextSchema = Joi.object({ text: Joi.string().max(300).required() });
    const markReadSchema = Joi.object({ read: Joi.boolean().required() });
    const reportSchema = Joi.object({
        report: Joi.boolean().required(),
        commentReport: Joi.string().allow(null,"").max(10000),
    });
    const qualificationSchema = Joi.object({ qualification: Joi.string().required() });

    router.get('/api/backoffice/avis', checkAuth, tryAndCatch(async (req, res) => {

        let { validators, queries } = getProfile(db, regions, req.user);
        const avisSchema = Joi.object({
            ...validators.form(),
            ...validators.filters(),
            ...validators.pagination(),
        });
        let parameters = Joi.attempt(req.query, avisSchema, '', { abortEarly: false });

        let query = await queries.buildAvisQuery(parameters);

        const itemsToSkip = (parameters.page || 0) * itemsPerPage;
        let cursor = db.collection('avis')
        .find(query)
        .project({ dispositifFinancement: 0, ...queries.fieldsToExclude() })
        .sort({ [parameters.sortBy || 'date']: -1 })
        .skip(itemsToSkip)
        .limit(itemsPerPage);

        const total = await db.collection('avis').countDocuments(query);
        const itemsOnThisPage = Math.min(total - itemsToSkip, itemsPerPage);

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
        const avisSchema = Joi.object({
            ...validators.form(),
            ...validators.filters(),
            token: Joi.string(),
        });
        let parameters = Joi.attempt(req.query, avisSchema, '', { abortEarly: false });

        let stream = db.collection('avis')
        .find({
            ...await queries.buildAvisQuery(parameters),
        })
        .sort({ [parameters.sortBy || 'date']: -1 })
        .stream();

        try {
            await sendCSVStream(stream, res, getAvisCSV(req.user), { encoding: 'utf8', filename: 'avis.csv' });
        } catch (e) {
            //FIXME we must handle errors
            logger.error('Unable to send CSV file', e);
        }
    }));

    router.put('/api/backoffice/avis/:id/title', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = Joi.attempt(req.params, idSchema, '', { abortEarly: false });
        let { mask } = Joi.attempt(req.body, maskTitleSchema, '', { abortEarly: false });

        let avis = await workflow.maskTitle(id, mask, { profile });

        return res.json(avis);
    }));

    router.put('/api/backoffice/avis/:id/reject', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = Joi.attempt(req.params, idSchema, '', { abortEarly: false });
        let { qualification } = Joi.attempt(req.body, qualificationSchema, '', { abortEarly: false });

        let updated = await workflow.reject(id, qualification, { profile, sendEmail: true });

        return res.json(updated);
    }));

    router.delete('/api/backoffice/avis/:id', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id, sendEmail } = Joi.attempt(Object.assign({}, req.query, req.params), resendMailSchema, '', { abortEarly: false });

        await workflow.delete(id, { profile, sendEmail });

        return res.json({ 'message': 'avis deleted' });
    }));

    router.put('/api/backoffice/avis/:id/validate', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = Joi.attempt(req.params, idSchema, '', { abortEarly: false });
        let { qualification } = Joi.attempt(req.body, qualificationSchema, '', { abortEarly: false });

        let updated = await workflow.validate(id, qualification, { profile, sendEmail: true });

        return res.json(updated);
    }));

    router.put('/api/backoffice/avis/:id/edit', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { text } = Joi.attempt(req.body, changeTextSchema, '', { abortEarly: false });
        let { id } = Joi.attempt(req.params, idSchema, '', { abortEarly: false });

        let avis = await workflow.edit(id, text, { profile });

        return res.json(avis);

    }));

    router.put('/api/backoffice/avis/:id/validateReponse', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = Joi.attempt(req.params, idSchema, '', { abortEarly: false });

        let avis = await workflow.validateReponse(id, { profile });

        return res.json(avis);

    }));

    router.put('/api/backoffice/avis/:id/rejectReponse', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = Joi.attempt(req.params, idSchema, '', { abortEarly: false });

        let avis = await workflow.rejectReponse(id, { profile, sendEmail: true });

        return res.json(avis);

    }));

    router.put('/api/backoffice/avis/:id/addReponse', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = Joi.attempt(req.params, idSchema, '', { abortEarly: false });
        let { text } = Joi.attempt(req.body, responseTextSchema, '', { abortEarly: false });

        let avis = await workflow.addReponse(id, text, { profile });

        return res.json(avis);
    }));

    router.put('/api/backoffice/avis/:id/removeReponse', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = Joi.attempt(req.params, idSchema, '', { abortEarly: false });

        let avis = await workflow.removeReponse(id, { profile });

        return res.json(avis);
    }));

    router.put('/api/backoffice/avis/:id/read', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = Joi.attempt(req.params, idSchema, '', { abortEarly: false });
        let { read } = Joi.attempt(req.body, markReadSchema, '', { abortEarly: false });

        let avis = await workflow.markAsRead(id, read, { profile });

        return res.json(avis);
    }));

    router.put('/api/backoffice/avis/:id/report', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        let profile = getProfile(db, regions, req.user);
        let { id } = Joi.attempt(req.params, idSchema, '', { abortEarly: false });
        let { report, commentReport } = Joi.attempt(req.body, reportSchema, '', { abortEarly: false });

        let avis = await workflow.report(id, report, commentReport, { profile });

        return res.json(avis);
    }));

    router.get('/api/backoffice/avis/stats', checkAuth, tryAndCatch(async (req, res) => {

        let { validators, queries } = getProfile(db, regions, req.user);
        const schema = Joi.object({
            ...validators.form(),
        });
        let parameters = Joi.attempt(req.query, schema, '', { abortEarly: false });

        let query = await queries.buildAvisQuery(parameters);
        let results = await getAvisStats(db, query);

        return res.json(results);
    }));

    return router;
};
