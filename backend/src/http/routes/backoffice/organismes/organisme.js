const express = require('express');
const Boom = require('boom');
const { tryAndCatch } = require('../../routes-utils');

module.exports = ({ db, configuration, password, middlewares }) => {

    let pagination = configuration.api.pagination;
    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let { hashPassword, isPasswordStrongEnough } = password;
    let allProfiles = checkProfile('moderateur', 'financeur', 'organisme');

    const checkOrganisme = req => {
        if (req.params.id !== req.user.id) {
            throw Boom.forbidden('Action non autorisé');
        }
    };

    router.get('/backoffice/organisme/getActivationAccountStatus', tryAndCatch(async (req, res) => {

        let organisme = await db.collection('accounts').findOne({ token: req.query.token });
        if (organisme) {
            if (!organisme.passwordHash) {
                delete organisme._id;
                return res.json({
                    raisonSociale: organisme.raisonSociale,
                    siret: organisme.meta.siretAsString,
                });
            }
        }
        throw Boom.badRequest('Numéro de token invalide');
    }));

    router.post('/backoffice/organisme/activateAccount', tryAndCatch(async (req, res) => {
        const token = req.body.token;
        const password = req.body.password;

        let organisme = await db.collection('accounts').findOne({ token });
        if (organisme) {
            if (!organisme.passwordHash) {
                if (isPasswordStrongEnough(password)) {
                    await db.collection('accounts').updateOne({ token }, {
                        $set: {
                            'meta.rehashed': true,
                            'passwordHash': await hashPassword(password)
                        }
                    });

                    return res.status(201).json({
                        message: 'Account successfully created',
                        userInfo: {
                            username: organisme.meta.siretAsString,
                            profile: 'organisme',
                            id: organisme._id
                        }
                    });
                }
                throw Boom.badRequest('Le mot de passe est invalide (il doit contenir au moins 6 caractères, une majuscule et un caractère spécial)');
            }
        }
        throw Boom.badRequest('Numéro de token invalide');
    }));

    router.get('/backoffice/organisme/:id/info', checkAuth, allProfiles, tryAndCatch(async (req, res) => {

        const organisation = await db.collection('accounts').findOne({ _id: parseInt(req.params.id) });
        if (organisation) {

            organisation.accountCreated = !!organisation.passwordHash;
            organisation.places = await db.collection('comment').aggregate([
                {
                    $match: {
                        '$or': [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }],
                        'training.organisation.siret': `${req.params.id}`
                    }
                },
                { $group: { _id: '$training.place.postalCode', city: { $first: '$training.place.city' } } },
                { $sort: { _id: 1 } }]).toArray();


            delete organisation.passwordHash;
            delete organisation.mailErrorDetail;
            delete organisation.mailError;

            res.status(200).send(organisation);
        } else {
            res.status(404).send({ 'error': 'Not found' });
        }
    }));

    router.get('/backoffice/organisme/:id/allAdvices', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        checkOrganisme(req);

        const projection = { token: 0 };
        let filter = { 'training.organisation.siret': req.params.id };
        if (req.query.filter) {
            if (req.query.filter === 'reported') {
                filter.reported = true;
            } else if (req.query.filter === 'read') {
                filter.read = true;
                filter.reported = { $ne: true };
            } else if (req.query.filter === 'unread') {
                filter.read = { $ne: true };
                filter.published = { $eq: true };
                filter.reported = { $ne: true };
            } else if (req.query.filter === 'answered') {
                filter.reponse = { $exists: true };
            } else if (req.query.filter === 'all') {
                filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
            }
        }

        let order = { date: -1 };
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

    router.get('/backoffice/organisme/:id/trainings', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        checkOrganisme(req);

        const organisation = await db.collection('accounts').findOne({ _id: parseInt(req.params.id) });

        if (organisation) {
            let filter = { $or: [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }] };
            if (req.query.postalCode) {
                filter = Object.assign(filter, { 'training.place.postalCode': req.query.postalCode });
            }
            filter = Object.assign(filter, { 'training.organisation.siret': `${req.params.id}` });
            const trainings = await db.collection('comment').aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$training.idFormation',
                        title: { $first: '$training.title' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { 'count': -1 } }]).toArray();
            res.status(200).send(trainings);
        } else {
            res.status(404).send({ 'error': 'Not found' });
        }
    }));

    router.get('/backoffice/organisme/:id/advices', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        checkOrganisme(req);

        const projection = { token: 0 };
        let filter = { 'training.organisation.siret': req.params.id };

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
            } else if (req.query.filter === 'read') {
                filter.read = true;
                filter.reported = { $ne: true };
            } else if (req.query.filter === 'unread') {
                filter.read = { $ne: true };
                filter.published = { $eq: true };
                filter.reported = { $ne: true };
            } else if (req.query.filter === 'answered') {
                filter.reponse = { $exists: true };
            } else if (req.query.filter === 'all') {
                filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
            }
        }

        let order = { date: -1 };
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

    router.get('/backoffice/organisme/:id/training/:idTraining/sessions', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        checkOrganisme(req);

        const organisation = await db.collection('accounts').findOne({ _id: parseInt(req.params.id) });

        if (organisation) {
            let filter = '';
            if (req.query.postalCode) {
                filter = Object.assign(filter, { 'training.place.postalCode': req.query.postalCode });
            }
            const trainings = await db.collection('comment').aggregate([
                {
                    $match: Object.assign(filter, {
                        'training.organisation.siret': `${req.params.id}`,
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
        } else {
            res.status(404).send({ 'error': 'Not found' });
        }
    }));

    router.get('/backoffice/organisme/:id/advices/inventory', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {


        if (req.params.id !== req.user.id) {
            throw Boom.forbidden('Action non autorisé');
        }

        const organisation = await db.collection('accounts').findOne({ _id: parseInt(req.params.id) });

        if (organisation) {
            const filter = { 'training.organisation.siret': `${req.params.id}` };

            if (req.query.trainingId === 'null') {
                Object.assign(filter, { 'training.place.postalCode': req.query.postalCode });
            } else {
                Object.assign(filter, {
                    'training.place.postalCode': req.query.postalCode,
                    'training.idFormation': req.query.trainingId
                });
            }

            let inventory = {};
            inventory.unread = await db.collection('comment').countDocuments({
                ...filter,
                published: true,
                read: { $ne: true },
                reported: { $ne: true }
            });
            inventory.read = await db.collection('comment').countDocuments({
                ...filter,
                read: true,
                reported: { $ne: true },
            });
            inventory.reported = await db.collection('comment').countDocuments({ ...filter, reported: true });
            inventory.answered = await db.collection('comment').countDocuments({
                ...filter,
                reponse: { $exists: true },
            });

            filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
            inventory.all = await db.collection('comment').countDocuments(filter);
            res.status(200).send(inventory);
        } else {
            res.status(404).send({ 'error': 'Not found' });
        }
    }));

    router.get('/backoffice/organisme/:id/allInventory', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        checkOrganisme(req);

        const organisation = await db.collection('accounts').findOne({ _id: parseInt(req.params.id) });
        if (organisation) {
            const filter = { 'training.organisation.siret': `${req.params.id}` };

            let inventory = {};

            inventory.unread = await db.collection('comment').countDocuments({
                ...filter,
                published: true,
                read: { $ne: true },
                reported: { $ne: true }
            });

            inventory.read = await db.collection('comment').countDocuments({
                ...filter,
                read: true,
                reported: { $ne: true },
            });

            inventory.reported = await db.collection('comment').countDocuments({ ...filter, reported: true });

            inventory.answered = await db.collection('comment').countDocuments({
                ...filter,
                reponse: { $exists: true },
            });

            filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
            inventory.all = await db.collection('comment').countDocuments(filter);
            res.status(200).send(inventory);
        } else {
            res.status(404).send({ 'error': 'Not found' });
        }
    }));

    router.get('/backoffice/organisme/:id/states', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        checkOrganisme(req);

        const organisation = await db.collection('accounts').findOne({ _id: parseInt(req.params.id) });
        if (organisation) {
            const trainings = await db.collection('comment').aggregate([
                {
                    $match: {
                        '$or': [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }],
                        'training.organisation.siret': `${req.params.id}`
                    }
                },
                {
                    $group: {
                        _id: `${req.params.id}`,
                        countAdvices: { $sum: 1 },
                        accueilFive: { $sum: { $cond: [{ $eq: ['$rates.accueil', 5] }, 1, 0] } },
                        accueilFour: { $sum: { $cond: [{ $eq: ['$rates.accueil', 4] }, 1, 0] } },
                        accueilThree: { $sum: { $cond: [{ $eq: ['$rates.accueil', 3] }, 1, 0] } },
                        accueilTwo: { $sum: { $cond: [{ $eq: ['$rates.accueil', 2] }, 1, 0] } },
                        accueilOne: { $sum: { $cond: [{ $eq: ['$rates.accueil', 1] }, 1, 0] } },
                        noteGlobaleFive: { $sum: { $cond: [{ $eq: ['$rates.global', 5] }, 1, 0] } },
                        noteGlobaleFour: { $sum: { $cond: [{ $eq: ['$rates.global', 4] }, 1, 0] } },
                        noteGlobaleThree: { $sum: { $cond: [{ $eq: ['$rates.global', 3] }, 1, 0] } },
                        noteGlobaleTwo: { $sum: { $cond: [{ $eq: ['$rates.global', 2] }, 1, 0] } },
                        noteGlobaleOne: { $sum: { $cond: [{ $eq: ['$rates.global', 1] }, 1, 0] } },
                        accompagnementFive: { $sum: { $cond: [{ $eq: ['$rates.accompagnement', 5] }, 1, 0] } },
                        accompagnementFour: { $sum: { $cond: [{ $eq: ['$rates.accompagnement', 4] }, 1, 0] } },
                        accompagnementThree: { $sum: { $cond: [{ $eq: ['$rates.accompagnement', 3] }, 1, 0] } },
                        accompagnementTwo: { $sum: { $cond: [{ $eq: ['$rates.accompagnement', 2] }, 1, 0] } },
                        accompagnementOne: { $sum: { $cond: [{ $eq: ['$rates.accompagnement', 1] }, 1, 0] } },
                        materielFive: { $sum: { $cond: [{ $eq: ['$rates.moyen_materiel', 5] }, 1, 0] } },
                        materielFour: { $sum: { $cond: [{ $eq: ['$rates.moyen_materiel', 4] }, 1, 0] } },
                        materielThree: { $sum: { $cond: [{ $eq: ['$rates.moyen_materiel', 3] }, 1, 0] } },
                        materielTwo: { $sum: { $cond: [{ $eq: ['$rates.moyen_materiel', 2] }, 1, 0] } },
                        materielOne: { $sum: { $cond: [{ $eq: ['$rates.moyen_materiel', 1] }, 1, 0] } },
                        equipeFive: { $sum: { $cond: [{ $eq: ['$rates.equipe_formateurs', 5] }, 1, 0] } },
                        equipeFour: { $sum: { $cond: [{ $eq: ['$rates.equipe_formateurs', 4] }, 1, 0] } },
                        equipeThree: { $sum: { $cond: [{ $eq: ['$rates.equipe_formateurs', 3] }, 1, 0] } },
                        equipeTwo: { $sum: { $cond: [{ $eq: ['$rates.equipe_formateurs', 2] }, 1, 0] } },
                        equipeOne: { $sum: { $cond: [{ $eq: ['$rates.equipe_formateurs', 1] }, 1, 0] } },
                        contenuFormationFive: { $sum: { $cond: [{ $eq: ['$rates.contenu_formation', 5] }, 1, 0] } },
                        contenuFormationFour: { $sum: { $cond: [{ $eq: ['$rates.contenu_formation', 4] }, 1, 0] } },
                        contenuFormationThree: { $sum: { $cond: [{ $eq: ['$rates.contenu_formation', 3] }, 1, 0] } },
                        contenuFormationTwo: { $sum: { $cond: [{ $eq: ['$rates.contenu_formation', 2] }, 1, 0] } },
                        contenuFormationOne: { $sum: { $cond: [{ $eq: ['$rates.contenu_formation', 1] }, 1, 0] } },
                    }
                },
                { $sort: { 'count': -1 } }]).toArray();

            res.status(200).send(trainings);

        } else {
            res.status(404).send({ 'error': 'Not found' });
        }
    }));

    return router;
};
