const express = require('express');
const { tryAndCatch } = require('../../../routes-utils');
const Boom = require('boom');
const moment = require('moment/moment');
const s = require('string');
const { transformObject, encodeStream } = require('../../../../../common/utils/stream-utils');
const getReponseStatus = require('../../../../../common/utils/getReponseStatus');


module.exports = ({ db, middlewares, configuration, logger, postalCodes }) => {

    const POLE_EMPLOI = '4';
    let pagination = configuration.api.pagination;
    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let allProfiles = checkProfile('moderateur', 'financeur', 'organisme');

    const checkCodeRegionAndCodeFinanceur = req => {
        if (req.params.idregion !== req.user.codeRegion ||
            (req.query.codeFinanceur && req.user.codeFinanceur !== POLE_EMPLOI && req.query.codeFinanceur !== req.user.codeFinanceur)) {
            throw Boom.forbidden('Action non autorisé');
        }
    };

    const buildLieuFilter = async lieu => {
        if (lieu) {
            if (lieu.length === 2 || lieu.length === 3) {
                return { 'training.place.postalCode': { '$regex': `^${lieu}.*` } };
            } else {
                const inseeCode = await postalCodes.findINSEECodeByINSEE(lieu);
                if (inseeCode) {
                    return {
                        '$or': [
                            { 'training.place.postalCode': { '$in': inseeCode.cedex } },
                            { 'training.place.postalCode': { '$in': inseeCode.postalCode } },
                            { 'training.place.postalCode': inseeCode.insee },
                            { 'training.place.postalCode': inseeCode.commune }
                        ]
                    };
                } else {
                    return { 'training.place.postalCode': lieu };
                }
            }
        }
        return {};
    };

    router.get('/backoffice/financeur/region/:idregion/organisations', checkAuth, allProfiles, tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        let filter = {
            '$or': [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }],
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        const lieuFilter = await buildLieuFilter(req.query.lieu);
        filter = Object.assign(filter, lieuFilter);

        const organisations = await db.collection('comment')
        .aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { $substr: ['$training.organisation.siret', 0, 9] },
                    city: { $first: '$training.place.city' },
                    name: { $first: '$training.organisation.name' },
                    label: { $first: '$training.organisation.label' },
                    count: { $sum: 1 }
                }
            }])
        .toArray();

        res.status(200).send(organisations);
    }));

    router.get('/backoffice/financeur/region/:idregion/advices', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        const projection = { token: 0 };

        let filter = { 'codeRegion': `${req.params.idregion}` };

        if (req.query.codeFinanceur) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        if (req.query.organisation) {
            filter = Object.assign(filter, { 'training.organisation.siret': { '$regex': `${req.query.organisation}` } });
        }

        if (req.query.formation) {
            filter = Object.assign(filter, { 'training.idFormation': req.query.formation });
        }

        if (req.query.filter) {
            if (req.query.filter === 'reported') {
                filter.reported = true;
            } else if (req.query.filter === 'commented') {
                filter.published = true;
                filter.comment = { $exists: true };
                filter.comment = { $ne: null };
            } else if (req.query.filter === 'rejected') {
                filter.rejected = true;
            } else if (req.query.filter === 'all') {
                filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
            }
        }

        const lieuFilter = await buildLieuFilter(req.query.lieu);
        const filterFinal = { $and: [filter, lieuFilter] };

        let order = { date: 1 };

        if (req.query.order && req.query.order === 'advicesDate') {
            order = { date: -1 };
        }

        let skip = 0;
        let page = 1;

        if (req.query.page) {
            try {
                page = parseInt(req.query.page);
                if (page - 1) {
                    skip = (page - 1) * pagination;
                }
            } catch (e) {
                res.send({ error: 404 });
                return;
            }
        }

        const count = await db.collection('comment').countDocuments(filterFinal);
        
        if (count < skip) {
            res.send({ error: 404 });
            return;
        }

        const results = await db.collection('comment').find(filterFinal, projection).sort(order).skip(skip).limit(pagination).toArray();
        const advices = results.map(advice => {
            if (advice.pseudoMasked) {
                advice.pseudo = '';
            }
            if (advice.titleMasked && advice.comment) {
                advice.comment.title = '';
            }
            return advice;
        });

        res.send({
            advices: advices,
            page: page,
            pageCount: Math.ceil(count / pagination)
        });
    }));

    router.get('/backoffice/financeur/region/:idregion/places', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        let filter = {
            '$or': [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }],
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }
        
        if (req.query.siren) {
            filter = Object.assign(filter, { 'training.organisation.siret': { '$regex': `${req.query.siren}` } });
        }

        const places = await db.collection('comment').aggregate([
            { $match: filter },
            { $group: { _id: '$training.place.postalCode', city: { $first: '$training.place.city' } } },
            { $sort: { _id: 1 } }]).toArray();

        let added = [];
        const promise = places.map(async place => {
            const inseeCity = await db.collection('inseeCode').findOne({
                $or: [
                    { cedex: { $elemMatch: { $eq: place._id } } },
                    { postalCode: { $elemMatch: { $eq: place._id } } },
                    { insee: place._id },
                    { commune: place._id }
                ]
            });
            if (inseeCity === null) {
                place.city = place.city.toUpperCase() + ' - inconnue : ' + place._id;
                place.codeINSEE = place._id;
                return place;
            } else if (added[inseeCity.insee] !== true) {
                added[inseeCity.insee] = true;
                return { codeINSEE: inseeCity.insee, city: inseeCity.commune };
            }
        });

        const aggregatedPlaces = await Promise.all(promise);

        res.status(200).send(aggregatedPlaces.filter(place => place !== undefined));
    }));

    router.get('/backoffice/financeur/region/:idregion/organisme_formateur/:siren/trainings', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        let filter = {
            '$or': [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }],
            'training.organisation.siret': { '$regex': `${req.params.siren}` },
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        const lieuFilter = await buildLieuFilter(req.query.lieu);
        filter = Object.assign(filter, lieuFilter);

        const trainings = await db.collection('comment').aggregate([
            { $match: filter },
            { $group: { _id: '$training.idFormation', title: { $first: '$training.title' }, count: { $sum: 1 } } },
            { $sort: { 'count': -1 } }]).toArray();

        res.status(200).send(trainings);
    }));

    router.get('/backoffice/financeur/organismes_formateurs/:siren/training/:idTraining/sessions', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        let filter = '';

        if (req.query.postalCode) {
            filter = Object.assign(filter, { 'training.place.postalCode': req.query.postalCode });
        }

        const trainings = await db.collection('comment').aggregate([
            {
                $match: Object.assign(filter, {
                    'training.organisation.siret': { '$regex': `${req.params.siren}` },
                    'training.idFormation': req.params.idTraining
                })
            },
            {
                $project: {
                    date: '$date',
                    place: '$training.place',
                    endDate: '$training.scheduledEndDate',
                    commentExist: { $cond: { if: { $eq: ['$comment', null] }, then: 0, else: 1 } }
                }
            },
            { $sort: { 'date': 1 } },
            {
                $group: {
                    _id: '$place.postalCode',
                    city: { $first: '$place.city' },
                    endDate: { $first: '$endDate' },
                    lastAdviceDate: { $last: '$date' },
                    advicesCount: { $sum: 1 },
                    commentsCount: { $sum: '$commentExist' }
                }
            },
            {
                $project: {
                    _id: 0,
                    postalCode: '$_id',
                    city: 1,
                    endDate: 1,
                    lastAdviceDate: 1,
                    advicesCount: 1,
                    commentsCount: 1
                }
            },
            { $sort: { 'endDate': -1 } }]).toArray();

        res.status(200).send(trainings);

    }));

    router.get('/backoffice/financeur/region/:idregion/inventory', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        let filter = {
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        const lieuFilter = await buildLieuFilter(req.query.lieu);

        if (req.query.organisation) {
            filter = Object.assign(filter, { 'training.organisation.siret': { '$regex': `${req.query.organisation}` } });
        }

        if (req.query.formation) {
            filter = Object.assign(filter, { 'training.idFormation': req.query.formation });
        }

        let inventory = {};
        inventory.reported = await db.collection('comment').countDocuments({ ...filter, reported: true });
        inventory.rejected = await db.collection('comment').countDocuments({ ...filter, rejected: true });
        inventory.commented = await db.collection('comment').countDocuments({
            $and: [{
                ...filter,
                published: true,
                comment: { $ne: null }
            },
            lieuFilter
            ]
        });
        inventory.all = await db.collection('comment').countDocuments({
            $and: [{
                ...filter,
                $or: [
                    { 'comment': null },
                    { 'comment': { $exists: false } },
                    { 'published': true }
                ],
            },
            lieuFilter
            ]
        });
        res.status(200).send(inventory);
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
            const lieuFilter = await buildLieuFilter(req.query.lieu);
            query = Object.assign(query, lieuFilter);
            if (req.query.formationId) {
                query['training.idFormation'] = req.query.formationId;
            }
        }

        let stream = await db.collection('comment').find(query, { token: 0 }).stream();
        let lines = 'id;note accueil;note contenu formation;note equipe formateurs;note matériel;note accompagnement;note global;pseudo;titre;commentaire;réponse OF;statut;id formation; titre formation;date début;date de fin prévue;siret organisme;libellé organisme;nom organisme;code postal;ville;id certif info;libellé certifInfo;id session;formacode;AES reçu;code financeur\n';

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
