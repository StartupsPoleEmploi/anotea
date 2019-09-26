const Joi = require('joi');
const _ = require('lodash');
const isEmail = require('isemail').validate;
const express = require('express');
const moment = require('moment');
const Boom = require('boom');
const ObjectID = require('mongodb').ObjectID;
const { objectId } = require('../../../../common/validators');
const { IdNotFoundError } = require('../../../../common/errors');
const computeAvisStats = require('./utils/computeAvisStats');
const { isPoleEmploi, getCodeFinanceurs } = require('../../../../common/utils/financeurs');
const { tryAndCatch, getRemoteAddress, sendArrayAsJsonStream, sendCSVStream } = require('../../routes-utils');

module.exports = ({ db, middlewares, configuration, regions, logger, moderation, mailing }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let allProfiles = checkProfile('moderateur', 'financeur', 'organisme');
    let itemsPerPage = configuration.api.pagination;

    const getStagiaire = email => db.collection('trainee').findOne({ 'trainee.email': email });

    let getValidators = user => {

        let region = regions.findRegionByCodeRegion(user.codeRegion);
        return {
            idFormation: Joi.string(),
            startDate: Joi.number(),
            scheduledEndDate: Joi.number(),
            reported: Joi.bool(),
            commentaires: Joi.bool(),
            fulltext: Joi.string(),
            status: Joi.string().valid(['none', 'published', 'rejected']),
            reponseStatus: Joi.string().valid(['none', 'published', 'rejected']),
            qualification: Joi.string().valid(['all', 'négatif', 'positif']),
            departement: Joi.string().valid(region.departements.map(d => d.code)),
            //Profile parameters
            siren: user.profile === 'organisme' ? Joi.any().forbidden() : Joi.string().min(9).max(9),
            codeFinanceur: isPoleEmploi(user.codeFinanceur) ? Joi.string().valid(getCodeFinanceurs()) : Joi.any().forbidden(),
        };
    };

    let buildQuery = async (user, parameters) => {
        let {
            departement, codeFinanceur, siren, qualification,
            idFormation, startDate, scheduledEndDate, fulltext,
            status, reponseStatus, reported, commentaires
        } = parameters;

        let fulltextIsEmail = isEmail(fulltext || '');
        let stagiaire = fulltextIsEmail ? await getStagiaire(fulltext) : null;
        //Profile parameters
        let organisme = siren ? new RegExp(`^${siren}`) : user.siret;
        let financeur = codeFinanceur || (isPoleEmploi(user.codeFinanceur) ? null : user.codeFinanceur);

        return {
            codeRegion: user.codeRegion,
            ...(user.profile !== 'financeur' ? { archived: false } : {}),
            ...(organisme ? { 'training.organisation.siret': organisme } : {}),
            ...(financeur ? { 'training.codeFinanceur': financeur } : {}),
            ...(qualification ? { qualification } : {}),
            ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
            ...(idFormation ? { 'training.idFormation': idFormation } : {}),
            ...(startDate ? { 'training.startDate': { $lte: moment(startDate).toDate() } } : {}),
            ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
            ...(_.isBoolean(reported) ? { reported } : {}),
            ...(_.isBoolean(commentaires) ? { comment: { $ne: null } } : {}),

            ...(status === 'none' ? { moderated: { $ne: true }, comment: { $ne: null } } : {}),
            ...(status === 'published' ? { published: true } : {}),
            ...(status === 'rejected' ? { rejected: true } : {}),

            ...(reponseStatus ? { reponse: { $exists: true } } : {}),
            ...(['none', 'published', 'rejected'].includes(reponseStatus) ? { 'reponse.status': reponseStatus } : {}),

            ...(fulltextIsEmail ? { token: stagiaire ? stagiaire.token : 'unknown' } : {}),
            ...(fulltext && !fulltextIsEmail ? { $text: { $search: fulltext } } : {}),
        };
    };

    router.get('/backoffice/avis', checkAuth, allProfiles, tryAndCatch(async (req, res) => {

        let user = req.user;
        let parameters = await Joi.validate(req.query, {
            ...getValidators(user),
            page: Joi.number().min(0).default(0),
            sortBy: Joi.string().allow(['date', 'lastStatusUpdate', 'reponse.lastStatusUpdate']).default('date'),
        }, { abortEarly: false });

        let query = await buildQuery(user, parameters);

        let cursor = db.collection('comment')
        .find(query)
        .sort({ [parameters.sortBy]: -1 })
        .skip((parameters.page || 0) * itemsPerPage)
        .limit(itemsPerPage);

        let [total, itemsOnThisPage, stats] = await Promise.all([
            cursor.count(),
            cursor.count(true),
            computeAvisStats(db, query),
        ]);

        return sendArrayAsJsonStream(cursor.stream(), res, {
            arrayPropertyName: 'avis',
            arrayWrapper: {
                meta: {
                    stats,
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

    router.get('/backoffice/avis.csv', checkAuth, allProfiles, tryAndCatch(async (req, res) => {

        let user = req.user;
        let parameters = await Joi.validate(req.query, {
            ...getValidators(user),
            sortBy: Joi.string().allow(['date', 'lastStatusUpdate', 'reponse.lastStatusUpdate']).default('date'),
        }, { abortEarly: false });

        let cursor = db.collection('comment')
        .find(await buildQuery(user, parameters))
        .sort({ [parameters.sortBy]: -1 });

        let sanitizeNote = note => `${note}`.replace(/\./g, ',');
        let sanitizeString = note => `${note}`.replace(/;/g, '').replace(/"/g, '').replace(/\r/g, ' ').replace(/\n/g, ' ').trim();
        let getStatus = comment => {
            if (comment.archived === true) {
                return 'Archivé';
            } else if (comment.published === true || comment.comment === undefined || comment.comment === null) {
                return 'Publié';
            } else {
                return 'En attente de modération';
            }
        };

        let getReponseStatus = reponse => {
            switch (reponse.status) {
                case 'rejected':
                    return 'Rejetée';
                case 'published':
                    return 'Validée';
                default:
                    return 'En attente de modération';
            }
        };

        try {
            await sendCSVStream(cursor.stream(), res, {
                'id': comment => comment._id,
                'note accueil': comment => sanitizeNote(comment.rates.accueil),
                'note contenu formation': comment => sanitizeNote(comment.rates.contenu_formation),
                'note equipe formateurs': comment => sanitizeNote(comment.rates.equipe_formateurs),
                'note matériel': comment => sanitizeNote(comment.rates.moyen_materiel),
                'note accompagnement': comment => sanitizeNote(comment.rates.accompagnement),
                'note global': comment => sanitizeNote(comment.rates.global),
                'pseudo': comment => sanitizeString(_.get(comment, 'comment.pseudo', '')),
                'titre': comment => sanitizeString(_.get(comment, 'comment.title', '')),
                'commentaire': comment => sanitizeString(_.get(comment, 'comment.text', '')),
                'qualification': comment => `${comment.qualification} ${comment.rejectReason}`,
                'statut': comment => getStatus(comment),
                'réponse': comment => sanitizeString(_.get(comment, 'reponse.text', '')),
                'réponse statut': comment => comment.reponse ? getReponseStatus(comment.reponse.status) : '',
                'id formation': comment => comment.training.idFormation,
                'titre formation': comment => comment.training.title,
                'date début': comment => moment(comment.training.startDate).format('DD/MM/YYYY'),
                'date de fin prévue': comment => moment(comment.training.scheduledEndDate).format('DD/MM/YYYY'),
                'siret organisme': comment => comment.training.organisation.siret,
                'libellé organisme': comment => comment.training.organisation.label,
                'nom organisme': comment => comment.training.organisation.name,
                'code postal': comment => comment.training.place.postalCode,
                'ville': comment => comment.training.place.city,
                'id certif info': comment => comment.training.certifInfo.id,
                'libellé certifInfo': comment => comment.training.certifInfo.label,
                'id session': comment => comment.training.idSession,
                'formacode': comment => comment.training.formacode,
                'AES reçu': comment => comment.training.aesRecu,
                'code financeur': comment => comment.training.codeFinanceur,
            }, { filename: 'avis.csv' });
        } catch (e) {
            //FIXME we must handle errors
            logger.error('Unable to send CSV file', e);
        }
    }));

    router.get('/backoffice/avis/stats', checkAuth, allProfiles, tryAndCatch(async (req, res) => {

        let user = req.user;
        let query = await buildQuery(user, {
            comment: { $ne: null },
            archived: false,
            codeRegion: user.codeRegion,
        });

        res.json(await computeAvisStats(db, query));
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
        let { sendInjureMail, sendAlerteMail } = mailing;

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { reason } = await Joi.validate(req.body, { reason: Joi.string().required() }, { abortEarly: false });

        let avis = await db.collection('comment').findOne({ _id: new ObjectID(id) });
        if (avis) {
            if (avis.reported) {
                await mailing.sendSignalementAccepteNotification(avis._id);
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
            sendMail(email, trainee, comment, reason);
        }

        return res.json(avis);
    }));

    router.delete('/backoffice/avis/:id', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });

        await moderation.delete(id, { event: { origin: getRemoteAddress(req) } });

        return res.json({ 'message': 'avis deleted' });
    }));

    router.put('/backoffice/avis/:id/publish', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        const { sendAvisPublieMail } = mailing;

        const { id } = await Joi.validate(req.params, { id: objectId().required() }, { abortEarly: false });
        const { qualification } = await Joi.validate(req.body, { qualification: Joi.string().required() }, { abortEarly: false });

        let avis = await db.collection('comment').findOne({ _id: new ObjectID(id) });
        if (avis) {
            if (avis.reported) {
                await mailing.sendSignalementRejeteNotification(avis._id);
            }
        } else {
            throw new IdNotFoundError(`Avis with identifier ${id} not found`);
        }

        avis = await moderation.publish(id, qualification, { event: { origin: getRemoteAddress(req) } });

        let trainee = await db.collection('trainee').findOne({ token: avis.token });
        let email = trainee.trainee.email;
        sendAvisPublieMail(email, trainee, avis, 'avis publié');

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

        await mailing.sendReponseRejeteeNotification(avis._id);

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

    return router;
};
