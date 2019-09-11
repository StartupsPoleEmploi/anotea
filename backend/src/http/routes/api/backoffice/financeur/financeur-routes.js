const Joi = require('joi');
const express = require('express');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../../routes-utils');
const Boom = require('boom');
const moment = require('moment');
const s = require('string');
const { transformObject, encodeStream } = require('../../../../../common/utils/stream-utils');
const getReponseStatus = require('../../../../../common/utils/getReponseStatus');
const getStatus = require('../../../../../common/utils/getStatus');

module.exports = ({ db, middlewares, configuration, logger, regions }) => {

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

    // TODO : don't generate on the fly (use cron for every region : see /jobs/export/region)
    router.get('/backoffice/export/avis.csv', checkAuth, tryAndCatch(async (req, res) => {

        let query = {};

        if (req.query.status === 'reported') {
            query['reported'] = true;
        } else if (req.query.status === 'commented') {
            query['published'] = true;
            query['$and'] = [
                { 'comment': { $ne: null } },
                {
                    $or: [
                        { 'comment.title': { $ne: '' } },
                        { 'comment.text': { $ne: '' } }
                    ]
                }
            ];
        } else if (req.query.status === 'rejected') {
            query['rejected'] = true;
        } else if (req.query.status === 'all') {
            query['$or'] = [
                { 'comment': null },
                { 'comment': { $exists: false } },
                { 'published': true }
            ];
        }

        if (req.query.filter === 'region') {
            query['training.infoRegion'] = { $ne: null };
        }

        if (req.user.profile === 'organisme') {
            query['training.organisation.siret'] = req.user.siret;
        } else if (req.user.profile === 'financeur') {
            query['codeRegion'] = req.user.codeRegion;

            if (req.query.codeFinanceur) {
                query['training.codeFinanceur'] = { '$elemMatch': { '$eq': req.query.codeFinanceur } };
            }
            if (req.query.siret) {
                query['training.organisation.siret'] = { '$regex': `${req.query.siret}` };
            }
            if (req.query.lieu) {
                query['training.place.postalCode'] = { '$regex': `^${req.query.lieu}.*` };
            }
            if (req.query.formationId) {
                query['training.idFormation'] = req.query.formationId;
            }
        }

        let stream = await db.collection('comment').find(query, { token: 0 }).stream();
        let lines = 'id;note accueil;note contenu formation;note equipe formateurs;note matériel;note accompagnement;note global;pseudo;titre;commentaire;statut;réponse OF;statut;id formation; titre formation;date début;date de fin prévue;siret organisme;libellé organisme;nom organisme;code postal;ville;id certif info;libellé certifInfo;id session;formacode;AES reçu;code financeur\n';

        if (req.user.codeFinanceur === POLE_EMPLOI || req.query.status === 'rejected') {
            let array = lines.split(';');
            array.splice(10, 0, 'qualification');
            lines = array.join(';');
        }

        res.setHeader('Content-disposition', 'attachment; filename=avis.csv');
        res.setHeader('Content-Type', 'text/csv; charset=iso-8859-1');
        res.write(lines);

        let handleError = e => {
            logger.error('An error occurred', e);
            res.status(500);
            stream.push(Boom.boomify(e).output.payload);
        };

        stream
        .on('error', handleError)
        .pipe(transformObject(async comment => {

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

            if (comment.comment !== undefined && comment.comment !== null) {
                comment.comment.pseudo = (comment.comment.pseudo !== undefined) ? comment.comment.pseudo.replace(/\r?\n|\r/g, ' ') : '';
                comment.comment.title = (comment.comment.title !== undefined) ? comment.comment.title.replace(/\r?\n|\r/g, ' ') : '';
                comment.comment.text = (comment.comment.text !== undefined) ? comment.comment.text.replace(/\r?\n|\r/g, ' ') : '';
            }

            return comment._id + ';' +
                (comment.rates !== undefined ? `${comment.rates.accueil}`.replace(/\./g, ',') : '') + ';' +
                (comment.rates !== undefined ? `${comment.rates.contenu_formation}`.replace(/\./g, ',') : '') + ';' +
                (comment.rates !== undefined ? `${comment.rates.equipe_formateurs}`.replace(/\./g, ',') : '') + ';' +
                (comment.rates !== undefined ? `${comment.rates.moyen_materiel}`.replace(/\./g, ',') : '') + ';' +
                (comment.rates !== undefined ? `${comment.rates.accompagnement}`.replace(/\./g, ',') : '') + ';' +
                (comment.rates !== undefined ? `${comment.rates.global}`.replace(/\./g, ',') : '') + ';' +
                (comment.comment !== undefined && comment.comment !== null ? '"' + s(comment.comment.pseudo).replaceAll(';', '').replaceAll('"', '').s + '"' : '') + ';' +
                (comment.comment !== undefined && comment.comment !== null ? '"' + s(comment.comment.title).replaceAll(';', '').replaceAll('"', '').s + '"' : '') + ';' +
                (comment.comment !== undefined && comment.comment !== null ? '"' + s(comment.comment.text).replaceAll(';', '').replaceAll('"', '').s + '"' : '') +
                qualification + ';' +
                getStatus(comment) + ';' +
                (comment.reponse !== undefined ? s(comment.reponse.text).replaceAll(';', '').replaceAll('"', '').replaceAll('\n', '').s + '"' : '') + ';' +
                (comment.reponse !== undefined ? getReponseStatus(comment.reponse.status) : '') + ';' +
                comment.training.idFormation + ';' +
                comment.training.title + ';' +
                moment(comment.training.startDate).format('DD/MM/YYYY') + ';' +
                moment(comment.training.scheduledEndDate).format('DD/MM/YYYY') + ';' +
                '"' + comment.training.organisation.siret + '";' +
                comment.training.organisation.label + ';' +
                comment.training.organisation.name + ';' +
                comment.training.place.postalCode + ';' +
                comment.training.place.city + ';' +
                '\'' + comment.training.certifInfo.id + '\';' +
                comment.training.certifInfo.label + ';' +
                comment.training.idSession + ';' +
                comment.training.formacode + ';' +
                comment.training.aesRecu + ';' +
                comment.training.codeFinanceur + '\n';
        }))
        .pipe(encodeStream('UTF-16BE'))
        .pipe(res)
        .on('end', () => res.end());
    }));

    return router;
};
