const Joi = require('joi');
const _ = require('lodash');
const isEmail = require('isemail').validate;
const express = require('express');
const moment = require('moment');
const computeAvisStats = require('./utils/computeAvisStats');
const { isPoleEmploi, getCodeFinanceurs } = require('../../../../common/utils/financeurs');
const { tryAndCatch, sendArrayAsJsonStream, sendCSVStream } = require('../../routes-utils');

module.exports = ({ db, middlewares, configuration, regions, logger }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let allProfiles = checkProfile('moderateur', 'financeur', 'organisme');
    let itemsPerPage = configuration.api.pagination;

    const getStagiaire = async email => {
        return db.collection('trainee').findOne({ 'trainee.email': email });
    };

    let getValidators = user => {

        let region = regions.findRegionByCodeRegion(user.codeRegion);

        return {
            idFormation: Joi.string(),
            startDate: Joi.number(),
            scheduledEndDate: Joi.number(),
            reported: Joi.bool(),
            archived: Joi.bool(),
            commentaires: Joi.bool(),
            fulltext: Joi.string(),
            status: Joi.string().valid(['none', 'published', 'rejected']),
            reponseStatus: Joi.string().valid(['none', 'published', 'rejected']),
            qualification: Joi.string().valid(['all', 'négatif', 'positif']),
            departement: Joi.string().valid(region.departements.map(d => d.code)),
            siren: user.profile === 'organisme' ? Joi.any().forbidden() : Joi.string().min(9).max(9),
            codeFinanceur: user.profile !== 'financeur' ? Joi.any().forbidden() :
                Joi.string().valid(isPoleEmploi(user.codeFinanceur) ? getCodeFinanceurs() : [user.codeFinanceur]),
        };
    };

    let buildQuery = async (user, parameters) => {
        let {
            departement, codeFinanceur, siren, qualification,
            idFormation, startDate, scheduledEndDate, fulltext,
            status, reponseStatus, archived, reported, commentaires
        } = parameters;

        let fulltextIsEmail = isEmail(fulltext || '');
        let stagiaire = fulltextIsEmail ? await getStagiaire(fulltext) : null;
        let organisme = (user.profile !== 'organisme' && siren) ? new RegExp(`^${siren}`) : user.siret;
        let financeur = codeFinanceur || user.codeFinanceur;

        return {
            codeRegion: user.codeRegion,
            ...(organisme ? { 'training.organisation.siret': organisme } : {}),
            ...(financeur ? { 'training.codeFinanceur': financeur } : {}),
            ...(qualification ? { qualification } : {}),
            ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
            ...(idFormation ? { 'training.idFormation': idFormation } : {}),
            ...(startDate ? { 'training.startDate': { $lte: moment(startDate).toDate() } } : {}),
            ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
            ...(_.isBoolean(reported) ? { reported } : {}),
            ...(_.isBoolean(archived) ? { archived } : {}),
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
        let parameters = await Joi.validate(req.query, {
            ...getValidators(user),
        }, { abortEarly: false });

        let query = await buildQuery(user, parameters);

        res.json(await computeAvisStats(db, query));
    }));

    return router;
};
