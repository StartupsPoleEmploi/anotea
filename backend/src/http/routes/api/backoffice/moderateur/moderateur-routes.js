const express = require('express');
const Joi = require('joi');
const Boom = require('boom');
const isEmail = require('isemail').validate;
const ObjectID = require('mongodb').ObjectID;
const { tryAndCatch, getRemoteAddress } = require('../../../routes-utils');
const computeModerationStats = require('./utils/computeModerationStats');
const { objectId } = require('../../../../../common/validators');

module.exports = ({ db, logger, middlewares, configuration, moderation, mailing }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let itemsPerPage = configuration.api.pagination;

    const getStagiaire = async email => {
        return db.collection('trainee').findOne({ 'trainee.email': email });
    };

    router.get('/backoffice/moderateur/avis', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { status, reponseStatus, fulltext, page, sortBy } = await Joi.validate(req.query, {
            status: Joi.string(),
            reponseStatus: Joi.string(),
            fulltext: Joi.string().allow('').default(''),
            page: Joi.number().min(0).default(0),
            sortBy: Joi.string().allow(['date', 'lastStatusUpdate', 'reponse.lastStatusUpdate']).default('date'),
        }, { abortEarly: false });

        let isEmailSearch = isEmail(fulltext);
        let stagiaire = null;
        if (isEmailSearch) {
            stagiaire = await getStagiaire(fulltext);
        }

        let cursor = db.collection('comment')
        .find({
            codeRegion: codeRegion,
            archived: false,
            ...(['none', 'published', 'rejected'].includes(status) ? { comment: { $ne: null } } : {}),
            ...(status === 'rejected' ? { rejected: true } : {}),
            ...(status === 'published' ? { published: true } : {}),
            ...(status === 'reported' ? { reported: true } : {}),
            ...(status === 'none' ? { moderated: { $ne: true } } : {}),
            ...(reponseStatus ? { reponse: { $exists: true } } : {}),
            ...(['none', 'published', 'rejected'].includes(reponseStatus) ? { 'reponse.status': reponseStatus } : {}),
            ...(isEmailSearch ? { token: stagiaire ? stagiaire.token : 'unknown' } : {}),
            ...(fulltext && !isEmailSearch ? { $text: { $search: fulltext } } : {}),
        })
        .project(fulltext ? { score: { $meta: 'textScore' } } : {})
        .sort(fulltext ? { score: { $meta: 'textScore' } } : { [sortBy]: -1 })
        .skip((page || 0) * itemsPerPage)
        .limit(itemsPerPage);

        let [total, avis, stats] = await Promise.all([
            cursor.count(),
            cursor.toArray(),
            computeModerationStats(db, codeRegion),
        ]);

        res.send({
            avis: avis,
            meta: {
                stats: stats,
                pagination: {
                    page: page,
                    itemsPerPage,
                    itemsOnThisPage: avis.length,
                    totalItems: total,
                    totalPages: Math.ceil(total / itemsPerPage),
                },
                ...(!stagiaire ? {} : {
                    stagiaire: {
                        email: stagiaire.trainee.email,
                        dnIndividuNational: stagiaire.trainee.dnIndividuNational,
                    },
                    fulltext,
                })
            }
        });
    }));

    router.get('/backoffice/moderateur/stats', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;

        res.json(await computeModerationStats(db, codeRegion));
    }));

    router.put('/backoffice/moderateur/avis/:id/pseudo', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { mask } = await Joi.validate(req.body, { mask: Joi.boolean().required() }, { abortEarly: false });

        let avis = await moderation.maskPseudo(id, mask, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    }));

    router.put('/backoffice/moderateur/avis/:id/title', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { mask } = await Joi.validate(req.body, { mask: Joi.boolean().required() }, { abortEarly: false });

        let avis = await moderation.maskTitle(id, mask, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    }));

    router.put('/backoffice/moderateur/avis/:id/reject', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let { sendInjureMail } = mailing;

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { reason } = await Joi.validate(req.body, { reason: Joi.string().required() }, { abortEarly: false });

        let avis = await moderation.reject(id, reason, { event: { origin: getRemoteAddress(req) } });

        if (reason === 'injure') {
            let comment = await db.collection('comment').findOne({ _id: new ObjectID(id) });
            let trainee = await db.collection('trainee').findOne({ token: comment.token });

            let email = trainee.trainee.email;
            sendInjureMail({ to: email }, trainee, comment, () => {
                logger.info(`email sent to ${email} pour`, reason);
            }, err => {
                logger.error(`Unable to send email to ${email}`, err);
            });
        }

        return res.json(avis);
    }));

    router.delete('/backoffice/moderateur/avis/:id', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        await moderation.delete(id, { event: { origin: getRemoteAddress(req) } });

        return res.json({ 'message': 'avis deleted' });
    }));

    router.put('/backoffice/moderateur/avis/:id/publish', checkAuth, checkProfile('moderateur'), async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { qualification } = await Joi.validate(req.body, { qualification: Joi.string().required() }, { abortEarly: false });

        let avis = await moderation.publish(id, qualification, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);
    });

    router.put('/backoffice/moderateur/avis/:id/edit', checkAuth, checkProfile('moderateur'), async (req, res) => {

        const { text } = await Joi.validate(req.body, { text: Joi.string().required() }, { abortEarly: false });
        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await moderation.edit(id, text, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);

    });

    router.put('/backoffice/moderateur/avis/:id/publishReponse', checkAuth, checkProfile('moderateur'), async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await moderation.publishReponse(id, { event: { origin: getRemoteAddress(req) } });

        return res.json(avis);

    });

    router.put('/backoffice/moderateur/avis/:id/rejectReponse', checkAuth, checkProfile('moderateur'), async (req, res) => {
        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        let avis = await moderation.rejectReponse(id, { event: { origin: getRemoteAddress(req) } });

        await mailing.sendReponseRejeteeNotification(avis._id);

        return res.json(avis);

    });

    router.put('/backoffice/moderateur/avis/:id/resendEmail', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
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
