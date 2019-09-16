const Joi = require('joi');
const _ = require('lodash');
const express = require('express');
const moment = require('moment');
const { tryAndCatch, sendArrayAsJsonStream, sendCSVStream } = require('../../../routes-utils');

module.exports = ({ db, middlewares, configuration, regions, logger }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let itemsPerPage = configuration.api.pagination;

    router.get('/backoffice/financeur/departements', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        let region = regions.findRegionByCodeRegion(req.user.codeRegion);
        return res.json(region.departements);
    }));

    router.get('/backoffice/financeur/organismes', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        const stream = await db.collection('comment')
        .aggregate([
            {
                $match: {
                    codeRegion: req.user.codeRegion,
                }
            },
            {
                $group: {
                    _id: { $substr: ['$training.organisation.siret', 0, 9] },
                    siren: { $first: { $substr: ['$training.organisation.siret', 0, 9] } },
                    name: { $first: '$training.organisation.name' },
                    nbAvis: { $sum: 1 }
                }
            },
            {
                $sort: {
                    name: 1
                }
            },
            {
                $project: {
                    _id: 0,
                }
            }
        ])
        .stream();

        return sendArrayAsJsonStream(stream, res);
    }));

    router.get('/backoffice/financeur/organismes/:siren/formations', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        let { siren } = await Joi.validate(req.params, {
            siren: Joi.string().required(),
        }, { abortEarly: false });

        let stream = await db.collection('comment')
        .aggregate([
            {
                $match: {
                    'codeRegion': req.user.codeRegion,
                    'training.organisation.siret': new RegExp(`^${siren}`),
                }
            },
            {
                $group: {
                    _id: '$training.idFormation',
                    idFormation: { $first: '$training.idFormation' },
                    title: { $first: '$training.title' },
                    nbAvis: { $sum: 1 }
                }
            },
            {
                $sort: {
                    titre: 1
                }
            },
            {
                $project: {
                    _id: 0,
                }
            }
        ])
        .stream();

        return sendArrayAsJsonStream(stream, res);
    }));

    let getQuery = (codeRegion, parameters) => {
        let { departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate, status, qualification } = parameters;

        return {
            codeRegion,
            ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
            ...(codeFinanceur ? { 'training.codeFinanceur': codeFinanceur } : {}),
            ...(siren ? { 'training.organisation.siret': new RegExp(`^${siren}`) } : {}),
            ...(idFormation ? { 'training.idFormation': new RegExp(`^${idFormation}`) } : {}),
            ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
            ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
            ...(idFormation ? { 'training.idFormation': new RegExp(`^${idFormation}`) } : {}),
            ...(qualification ? { comment: { $ne: null } } : {}),
            ...(['positif', 'négatif'].includes(qualification) ? { qualification } : {}),
            ...(status === 'reported' ? { reported: true } : {}),
            ...(status === 'rejected' ? { rejected: true } : {}),
        };
    };

    let getQueryParametersValidators = () => {
        return {
            departement: Joi.string(),
            codeFinanceur: Joi.string(),
            siren: Joi.string(),
            idFormation: Joi.string(),
            startDate: Joi.number(),
            scheduledEndDate: Joi.number(),
        };
    };

    router.get('/backoffice/financeur/avis', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let parameters = await Joi.validate(req.query, {
            ...getQueryParametersValidators(),
            status: Joi.string().allow(['all', 'reported', 'rejected']),
            qualification: Joi.string().allow(['all', 'négatif', 'positif']),
            page: Joi.number().min(0).default(0),
            sortBy: Joi.string().allow(['date', 'lastStatusUpdate', 'reponse.lastStatusUpdate']).default('date'),
        }, { abortEarly: false });


        let cursor = db.collection('comment')
        .find(getQuery(codeRegion, parameters))
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

    router.get('/backoffice/financeur/avis.csv', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let parameters = await Joi.validate(req.query, {
            ...getQueryParametersValidators(),
            status: Joi.string().allow(['all', 'reported', 'rejected']),
            qualification: Joi.string().allow(['all', 'négatif', 'positif']),
            token: Joi.string(),
        }, { abortEarly: false });

        let cursor = db.collection('comment')
        .find(getQuery(codeRegion, parameters))
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

    router.get('/backoffice/financeur/stats', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let parameters = await Joi.validate(req.query, {
            ...getQueryParametersValidators(),
        }, { abortEarly: false });

        let results = await db.collection('comment').aggregate([
            {
                $match: {
                    ...getQuery(codeRegion, parameters),
                    $or: [
                        { comment: { $exists: false } },
                        { published: true },
                        { rejected: true },
                    ],
                }
            },
            {
                $group: {
                    _id: 'null',
                    total: { $sum: 1 },
                    accueil: { $avg: '$rates.accueil' },
                    accueil_1: { $sum: { $cond: [{ $gte: ['$rates.accueil', 1] }, 1, 0] } },
                    accueil_2: { $sum: { $cond: [{ $gte: ['$rates.accueil', 2] }, 1, 0] } },
                    accueil_3: { $sum: { $cond: [{ $gte: ['$rates.accueil', 3] }, 1, 0] } },
                    accueil_4: { $sum: { $cond: [{ $gte: ['$rates.accueil', 4] }, 1, 0] } },
                    accueil_5: { $sum: { $cond: [{ $gte: ['$rates.accueil', 5] }, 1, 0] } },
                    contenu_formation: { $avg: '$rates.contenu_formation' },
                    contenu_formation_1: { $sum: { $cond: [{ $gte: ['$rates.contenu_formation', 1] }, 1, 0] } },
                    contenu_formation_2: { $sum: { $cond: [{ $gte: ['$rates.contenu_formation', 2] }, 1, 0] } },
                    contenu_formation_3: { $sum: { $cond: [{ $gte: ['$rates.contenu_formation', 3] }, 1, 0] } },
                    contenu_formation_4: { $sum: { $cond: [{ $gte: ['$rates.contenu_formation', 4] }, 1, 0] } },
                    contenu_formation_5: { $sum: { $cond: [{ $gte: ['$rates.contenu_formation', 5] }, 1, 0] } },
                    equipe_formateurs: { $avg: '$rates.equipe_formateurs' },
                    equipe_formateurs_1: { $sum: { $cond: [{ $gte: ['$rates.equipe_formateurs', 1] }, 1, 0] } },
                    equipe_formateurs_2: { $sum: { $cond: [{ $gte: ['$rates.equipe_formateurs', 2] }, 1, 0] } },
                    equipe_formateurs_3: { $sum: { $cond: [{ $gte: ['$rates.equipe_formateurs', 3] }, 1, 0] } },
                    equipe_formateurs_4: { $sum: { $cond: [{ $gte: ['$rates.equipe_formateurs', 4] }, 1, 0] } },
                    equipe_formateurs_5: { $sum: { $cond: [{ $gte: ['$rates.equipe_formateurs', 5] }, 1, 0] } },
                    moyen_materiel: { $avg: '$rates.moyen_materiel' },
                    moyen_materiel_1: { $sum: { $cond: [{ $gte: ['$rates.moyen_materiel', 1] }, 1, 0] } },
                    moyen_materiel_2: { $sum: { $cond: [{ $gte: ['$rates.moyen_materiel', 2] }, 1, 0] } },
                    moyen_materiel_3: { $sum: { $cond: [{ $gte: ['$rates.moyen_materiel', 3] }, 1, 0] } },
                    moyen_materiel_4: { $sum: { $cond: [{ $gte: ['$rates.moyen_materiel', 4] }, 1, 0] } },
                    moyen_materiel_5: { $sum: { $cond: [{ $gte: ['$rates.moyen_materiel', 5] }, 1, 0] } },
                    accompagnement: { $avg: '$rates.accompagnement' },
                    accompagnement_1: { $sum: { $cond: [{ $gte: ['$rates.accompagnement', 1] }, 1, 0] } },
                    accompagnement_2: { $sum: { $cond: [{ $gte: ['$rates.accompagnement', 2] }, 1, 0] } },
                    accompagnement_3: { $sum: { $cond: [{ $gte: ['$rates.accompagnement', 3] }, 1, 0] } },
                    accompagnement_4: { $sum: { $cond: [{ $gte: ['$rates.accompagnement', 4] }, 1, 0] } },
                    accompagnement_5: { $sum: { $cond: [{ $gte: ['$rates.accompagnement', 5] }, 1, 0] } },
                    global: { $avg: '$rates.global' },
                    global_1: { $sum: { $cond: [{ $gte: ['$rates.global', 1] }, 1, 0] } },
                    global_2: { $sum: { $cond: [{ $gte: ['$rates.global', 2] }, 1, 0] } },
                    global_3: { $sum: { $cond: [{ $gte: ['$rates.global', 3] }, 1, 0] } },
                    global_4: { $sum: { $cond: [{ $gte: ['$rates.global', 4] }, 1, 0] } },
                    global_5: { $sum: { $cond: [{ $gte: ['$rates.global', 5] }, 1, 0] } },
                    nbCommentaires: { $sum: { $cond: { if: { $not: ['$comment'] }, then: 0, else: 1 } } },
                    nbPublished: { $sum: { $cond: { if: { $eq: ['$published', true] }, then: 1, else: 0 } } },
                    nbRejected: { $sum: { $cond: { if: { $eq: ['$rejected', true] }, then: 1, else: 0 } } },
                    nbPositifs: { $sum: { $cond: [{ $and: [{ $eq: ['$published', true] }, { $eq: ['$qualification', 'positif'] }] }, 1, 0] } },
                    nbNegatifs: { $sum: { $cond: [{ $and: [{ $eq: ['$published', true] }, { $eq: ['$qualification', 'négatif'] }] }, 1, 0] } },
                    nbAlertes: { $sum: { $cond: [{ $and: [{ $eq: ['$rejected', true] }, { $eq: ['$rejectReason', 'alerte'] }] }, 1, 0] } },
                    nbInjures: { $sum: { $cond: [{ $and: [{ $eq: ['$rejected', true] }, { $eq: ['$rejectReason', 'injure'] }] }, 1, 0] } },
                    nbNonConcernes: { $sum: { $cond: [{ $and: [{ $eq: ['$rejected', true] }, { $eq: ['$rejectReason', 'non concerné'] }] }, 1, 0] } },
                }
            },
            {
                $project: {
                    _id: 0,
                }
            }
        ])
        .toArray();

        return res.json(results[0]);
    }));

    return router;
};
