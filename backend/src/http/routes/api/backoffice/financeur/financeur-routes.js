const express = require('express');
const { tryAndCatch } = require('../../../routes-utils');
const Boom = require('boom');

module.exports = ({ db, middlewares, configuration }) => {

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

    router.get('/backoffice/financeur/region/:idregion/organisations', checkAuth, allProfiles, tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        let filter = {
            '$or': [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }],
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur && req.query.codeFinanceur !== POLE_EMPLOI) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

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

        if (req.query.codeFinanceur && req.query.codeFinanceur !== POLE_EMPLOI) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        if (req.query.filter) {
            if (req.query.filter === 'reported') {
                filter.reported = true;
            } else if (req.query.filter === 'commented') {
                filter.published = true;
                filter.comment = { $exists: true };
                filter.comment = { $ne: null };
            } else if (req.query.filter === 'all') {
                filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
            }
        }

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

        const count = await db.collection('comment').countDocuments(filter);
        if (count < skip) {
            res.send({ error: 404 });
            return;
        }

        const results = await db.collection('comment').find(filter, projection).sort(order).skip(skip).limit(pagination).toArray();
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

    router.get('/backoffice/financeur/region/:idregion/organisation/:siren/avis', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        const projection = { token: 0 };
        let filter = {
            'training.organisation.siret': { '$regex': `${req.params.siren}` },
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur && req.query.codeFinanceur !== POLE_EMPLOI) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        if (req.query.filter) {
            if (req.query.filter === 'reported') {
                filter.reported = true;
            } else if (req.query.filter === 'commented') {
                filter.published = true;
                filter.comment = { $exists: true };
                filter.comment = { $ne: null };
            } else if (req.query.filter === 'all') {
                filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
            }
        }

        let order = { date: 1 };
        if (req.query.order) {
            if (req.query.order === 'advicesDate') {
                order = { date: -1 };
            }
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
        const count = await db.collection('comment').countDocuments(filter);
        if (count < skip) {
            res.send({ error: 404 });
            return;
        }

        const results = await db.collection('comment').find(filter, projection).sort(order).skip(skip).limit(pagination).toArray();
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

    router.get('/backoffice/financeur/region/:idregion/organisme_lieu/:siren/advices', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        const projection = { token: 0 };
        let filter = {
            'training.organisation.siret': { '$regex': `${req.params.siren}` },
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur && req.query.codeFinanceur !== POLE_EMPLOI) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        if (req.query.trainingId === 'null') {
            Object.assign(filter, { 'training.place.postalCode': req.query.postalCode });
        } else {
            Object.assign(filter, {
                'training.place.postalCode': req.query.postalCode,
                'training.idFormation': req.query.trainingId
            });
        }

        if (req.query.filter) {
            if (req.query.filter === 'reported') {
                filter.reported = true;
            } else if (req.query.filter === 'commented') {
                filter.published = true;
                filter.comment = { $exists: true };
                filter.comment = { $ne: null };
            } else if (req.query.filter === 'all') {
                filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
            }
        }

        let order = { date: 1 };
        if (req.query.order) {
            if (req.query.order === 'advicesDate') {
                order = { date: -1 };
            }
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

        const count = await db.collection('comment').countDocuments(filter);
        if (count < skip) {
            res.send({ error: 404 });
            return;
        }
        const results = await db.collection('comment').find(filter, projection).sort(order).skip(skip).limit(pagination).toArray();
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

    router.get('/backoffice/financeur/region/:idregion/organisation/:siren/places', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        let filter = {
            '$or': [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }],
            'training.organisation.siret': { '$regex': `${req.params.siren}` },
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur && req.query.codeFinanceur !== POLE_EMPLOI) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        const places = await db.collection('comment').aggregate([
            { $match: filter },
            { $group: { _id: '$training.place.postalCode', city: { $first: '$training.place.city' } } },
            { $sort: { _id: 1 } }]).toArray();

        res.status(200).send(places);
    }));

    router.get('/backoffice/financeur/region/:idregion/organisme_formateur/:siren/trainings', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        let filter = {
            '$or': [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }],
            'training.organisation.siret': { '$regex': `${req.params.siren}` },
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur && req.query.codeFinanceur !== POLE_EMPLOI) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        if (req.query.postalCode) {
            filter = Object.assign(filter, { 'training.place.postalCode': req.query.postalCode });
        }

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

    router.get('/backoffice/financeur/region/:idregion/organisation/:siren/avis/inventory', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        let filter = {
            'training.organisation.siret': { '$regex': `${req.params.siren}` },
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur && req.query.codeFinanceur !== POLE_EMPLOI) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        let inventory = {};
        inventory.reported = await db.collection('comment').countDocuments({ ...filter, reported: true });
        inventory.commented = await db.collection('comment').countDocuments({
            ...filter,
            published: true,
            comment: { $ne: null }
        });
        filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
        inventory.all = await db.collection('comment').countDocuments(filter);

        res.status(200).send(inventory);
    }));

    router.get('/backoffice/financeur/region/:idregion/organisme_lieu/:siren/advices/inventory', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        let filter = {
            'training.organisation.siret': { '$regex': `${req.params.siren}` },
            'codeRegion': `${req.params.idregion}`
        };

        if (req.query.codeFinanceur && req.query.codeFinanceur !== POLE_EMPLOI) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        if (req.query.trainingId === 'null') {
            Object.assign(filter, { 'training.place.postalCode': req.query.postalCode });
        } else {
            Object.assign(filter, {
                'training.place.postalCode': req.query.postalCode,
                'training.idFormation': req.query.trainingId
            });
        }

        let inventory = {};
        inventory.reported = await db.collection('comment').countDocuments({ ...filter, reported: true });
        inventory.commented = await db.collection('comment').countDocuments({
            ...filter,
            published: true,
            comment: { $ne: null }
        });

        filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
        inventory.all = await db.collection('comment').countDocuments(filter);
        res.status(200).send(inventory);
    }));

    router.get('/backoffice/financeur/region/:idregion/inventory', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        checkCodeRegionAndCodeFinanceur(req);

        let filter = { 'codeRegion': `${req.params.idregion}` };

        if (req.query.codeFinanceur && req.query.codeFinanceur !== POLE_EMPLOI) {
            filter = Object.assign(filter, { 'training.codeFinanceur': { $in: [`${req.query.codeFinanceur}`] } });
        }

        let inventory = {};
        inventory.reported = await db.collection('comment').countDocuments({ ...filter, reported: true });
        inventory.commented = await db.collection('comment').countDocuments({
            ...filter,
            published: true,
            comment: { $ne: null }
        });

        filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
        inventory.all = await db.collection('comment').countDocuments(filter);
        res.status(200).send(inventory);
    }));

    return router;
};
