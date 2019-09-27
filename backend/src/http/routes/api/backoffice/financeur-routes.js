const Joi = require('joi');
const _ = require('lodash');
const express = require('express');
const moment = require('moment');
const { round } = require('../../../../common/utils/number-utils');
const { isPoleEmploi } = require('../../../../common/utils/financeurs');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../routes-utils');

module.exports = ({ db, middlewares, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');

    let getFormValidators = user => {
        return {
            departement: Joi.string(),
            codeFinanceur: isPoleEmploi(user.codeFinanceur) ? Joi.string() : Joi.string().valid([user.codeFinanceur]),
            siren: Joi.string(),
            idFormation: Joi.string(),
            startDate: Joi.number(),
            scheduledEndDate: Joi.number(),
        };
    };

    let buildFormQuery = (user, parameters) => {
        let { departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate } = parameters;

        return {
            'codeRegion': user.codeRegion,
            'training.codeFinanceur': codeFinanceur || user.codeFinanceur,
            ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
            ...(siren ? { 'training.organisation.siret': new RegExp(`^${siren}`) } : {}),
            ...(idFormation ? { 'training.idFormation': idFormation } : {}),
            ...(startDate ? { 'training.startDate': { $lte: moment(startDate).toDate() } } : {}),
            ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
        };
    };

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

    router.get('/backoffice/financeur/stats', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        let parameters = await Joi.validate(req.query, {
            ...getFormValidators(req.user),
        }, { abortEarly: false });

        let results = await db.collection('comment').aggregate([
            {
                $match: {
                    ...buildFormQuery(req.user, parameters),
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
                    accueil__moyenne: { $avg: '$rates.accueil' },
                    accueil__1: { $sum: { $cond: [{ $eq: ['$rates.accueil', 1] }, 1, 0] } },
                    accueil__2: { $sum: { $cond: [{ $eq: ['$rates.accueil', 2] }, 1, 0] } },
                    accueil__3: { $sum: { $cond: [{ $eq: ['$rates.accueil', 3] }, 1, 0] } },
                    accueil__4: { $sum: { $cond: [{ $eq: ['$rates.accueil', 4] }, 1, 0] } },
                    accueil__5: { $sum: { $cond: [{ $eq: ['$rates.accueil', 5] }, 1, 0] } },
                    contenu_formation__moyenne: { $avg: '$rates.contenu_formation' },
                    contenu_formation__1: { $sum: { $cond: [{ $eq: ['$rates.contenu_formation', 1] }, 1, 0] } },
                    contenu_formation__2: { $sum: { $cond: [{ $eq: ['$rates.contenu_formation', 2] }, 1, 0] } },
                    contenu_formation__3: { $sum: { $cond: [{ $eq: ['$rates.contenu_formation', 3] }, 1, 0] } },
                    contenu_formation__4: { $sum: { $cond: [{ $eq: ['$rates.contenu_formation', 4] }, 1, 0] } },
                    contenu_formation__5: { $sum: { $cond: [{ $eq: ['$rates.contenu_formation', 5] }, 1, 0] } },
                    equipe_formateurs__moyenne: { $avg: '$rates.equipe_formateurs' },
                    equipe_formateurs__1: { $sum: { $cond: [{ $eq: ['$rates.equipe_formateurs', 1] }, 1, 0] } },
                    equipe_formateurs__2: { $sum: { $cond: [{ $eq: ['$rates.equipe_formateurs', 2] }, 1, 0] } },
                    equipe_formateurs__3: { $sum: { $cond: [{ $eq: ['$rates.equipe_formateurs', 3] }, 1, 0] } },
                    equipe_formateurs__4: { $sum: { $cond: [{ $eq: ['$rates.equipe_formateurs', 4] }, 1, 0] } },
                    equipe_formateurs__5: { $sum: { $cond: [{ $eq: ['$rates.equipe_formateurs', 5] }, 1, 0] } },
                    moyen_materiel__moyenne: { $avg: '$rates.moyen_materiel' },
                    moyen_materiel__1: { $sum: { $cond: [{ $eq: ['$rates.moyen_materiel', 1] }, 1, 0] } },
                    moyen_materiel__2: { $sum: { $cond: [{ $eq: ['$rates.moyen_materiel', 2] }, 1, 0] } },
                    moyen_materiel__3: { $sum: { $cond: [{ $eq: ['$rates.moyen_materiel', 3] }, 1, 0] } },
                    moyen_materiel__4: { $sum: { $cond: [{ $eq: ['$rates.moyen_materiel', 4] }, 1, 0] } },
                    moyen_materiel__5: { $sum: { $cond: [{ $eq: ['$rates.moyen_materiel', 5] }, 1, 0] } },
                    accompagnement__moyenne: { $avg: '$rates.accompagnement' },
                    accompagnement__1: { $sum: { $cond: [{ $eq: ['$rates.accompagnement', 1] }, 1, 0] } },
                    accompagnement__2: { $sum: { $cond: [{ $eq: ['$rates.accompagnement', 2] }, 1, 0] } },
                    accompagnement__3: { $sum: { $cond: [{ $eq: ['$rates.accompagnement', 3] }, 1, 0] } },
                    accompagnement__4: { $sum: { $cond: [{ $eq: ['$rates.accompagnement', 4] }, 1, 0] } },
                    accompagnement__5: { $sum: { $cond: [{ $eq: ['$rates.accompagnement', 5] }, 1, 0] } },
                    global__moyenne: { $avg: '$rates.global' },
                    global__1: { $sum: { $cond: [{ $eq: ['$rates.global', 1] }, 1, 0] } },
                    global__2: { $sum: { $cond: [{ $eq: ['$rates.global', 2] }, 1, 0] } },
                    global__3: { $sum: { $cond: [{ $eq: ['$rates.global', 3] }, 1, 0] } },
                    global__4: { $sum: { $cond: [{ $eq: ['$rates.global', 4] }, 1, 0] } },
                    global__5: { $sum: { $cond: [{ $eq: ['$rates.global', 5] }, 1, 0] } },
                    nbNotesSeules: { $sum: { $cond: { if: { $not: ['$comment'] }, then: 1, else: 0 } } },
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

        let stats = results[0];
        if (!stats) {
            return res.json({});
        }

        return res.json(Object.keys(stats).reduce((acc, key) => {

            //Mongo can not round with 2 digits yet
            let roundedValue = round(stats[key]);

            //Wrap all notes under a parent property (can be done painfully with $project)
            if (key.indexOf('_') !== -1) {
                let parentPropertyName = key.split('__')[0];
                let propertyName = key.split('__')[1];
                acc.notes[parentPropertyName] = Object.assign(
                    {},
                    acc.notes[parentPropertyName] || {},
                    { [propertyName]: roundedValue });
            } else {
                acc[key] = roundedValue;
            }
            return acc;
        }, { notes: {} }));
    }));

    return router;
};
