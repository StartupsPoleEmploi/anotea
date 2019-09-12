const Joi = require('joi');
const _ = require('lodash');
const express = require('express');
const { tryAndCatch, sendArrayAsJsonStream, sendCSVStream } = require('../../../routes-utils');
const moment = require('moment');

module.exports = ({ db, middlewares, configuration, regions, logger }) => {

    const POLE_EMPLOI = '4';
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

    router.get('/backoffice/financeur/avis', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate, status, page, sortBy } = await Joi.validate(req.query, {
            departement: Joi.string(),
            codeFinanceur: Joi.string(),
            siren: Joi.string(),
            idFormation: Joi.string(),
            startDate: Joi.number(),
            scheduledEndDate: Joi.number(),
            status: Joi.string(),
            page: Joi.number().min(0).default(0),
            sortBy: Joi.string().allow(['date', 'lastStatusUpdate', 'reponse.lastStatusUpdate']).default('date'),
        }, { abortEarly: false });

        let cursor = db.collection('comment')
        .find({
            codeRegion: codeRegion,
            ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
            ...(codeFinanceur ? { 'training.codeFinanceur': codeFinanceur } : {}),
            ...(siren ? { 'training.organisation.siret': new RegExp(`^${siren}`) } : {}),
            ...(idFormation ? { 'training.idFormation': new RegExp(`^${idFormation}`) } : {}),
            ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
            ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
            ...(idFormation ? { 'training.idFormation': new RegExp(`^${idFormation}`) } : {}),
            ...(['none', 'published', 'rejected'].includes(status) ? { comment: { $ne: null } } : {}),
            ...(status === 'rejected' ? { rejected: true } : {}),
            ...(status === 'published' ? { published: true } : {}),
            ...(status === 'reported' ? { reported: true } : {}),
            ...(status === 'none' ? { moderated: { $ne: true } } : {}),
        })
        .sort({ [sortBy]: -1 })
        .skip((page || 0) * itemsPerPage)
        .limit(itemsPerPage);

        let [total, avis] = await Promise.all([
            cursor.count(),
            cursor.toArray(),
        ]);

        res.send({
            avis: avis,
            meta: {
                pagination: {
                    page: page,
                    itemsPerPage,
                    itemsOnThisPage: avis.length,
                    totalItems: total,
                    totalPages: Math.ceil(total / itemsPerPage),
                },
            }
        });
    }));

    router.get('/backoffice/financeur/avis.csv', checkAuth, async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate, status, sortBy } = await Joi.validate(req.query, {
            departement: Joi.string(),
            codeFinanceur: Joi.string(),
            siren: Joi.string(),
            idFormation: Joi.string(),
            startDate: Joi.number(),
            scheduledEndDate: Joi.number(),
            status: Joi.string(),
            sortBy: Joi.string().allow(['date', 'lastStatusUpdate', 'reponse.lastStatusUpdate']).default('date'),
            token: Joi.string().required(),
        }, { abortEarly: false });

        let stream = db.collection('comment')
        .find({
            codeRegion: codeRegion,
            ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
            ...(codeFinanceur ? { 'training.codeFinanceur': codeFinanceur } : {}),
            ...(siren ? { 'training.organisation.siret': new RegExp(`^${siren}`) } : {}),
            ...(idFormation ? { 'training.idFormation': new RegExp(`^${idFormation}`) } : {}),
            ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
            ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
            ...(idFormation ? { 'training.idFormation': new RegExp(`^${idFormation}`) } : {}),
            ...(['none', 'published', 'rejected'].includes(status) ? { comment: { $ne: null } } : {}),
            ...(status === 'rejected' ? { rejected: true } : {}),
            ...(status === 'published' ? { published: true } : {}),
            ...(status === 'reported' ? { reported: true } : {}),
            ...(status === 'none' ? { moderated: { $ne: true } } : {}),
        })
        .sort({ [sortBy]: -1 })
        .stream();

        let getQualification = comment => {
            let qualification = '';

            if (req.query.status === 'rejected') {
                qualification = ';' + (comment.rejectReason !== undefined ? comment.rejectReason : '');
            } else if (req.user.codeFinanceur === POLE_EMPLOI) {
                qualification = ';';
                if (comment.published) {
                    qualification += comment.qualification !== undefined ? comment.qualification : '';
                } else if (comment.rejected) {
                    qualification += comment.rejectReason !== undefined ? comment.rejectReason : '';
                }
            }
            return qualification;
        };

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
            if (reponse.status === 'rejected') {
                return 'Rejetée';
            } else if (reponse.status === 'published') {
                return 'Validée';
            } else {
                return 'En attente de modération';
            }
        };

        let sanitizeNote = note => `${note}`.replace(/\./g, ',');
        let sanitizeString = note => `${note}`.replace(/;/g, '').replace(/"/g, '').replace(/\r/g, ' ').replace(/\n/g, ' ').trim();

        try {
            await sendCSVStream(stream, res, {
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
                'qualification': comment => getQualification(comment),
                'statut': comment => getStatus(comment),
                'réponse OF': comment => sanitizeString(_.get(comment, 'reponse.text', '')),
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
            logger.error('Unable to send CSV file', e);
        }

    });

    return router;
};
