const express = require('express');
const moment = require('moment');
const Boom = require('boom');
const s = require('string');
const { tryAndCatch } = require('../../../routes-utils');
const { transformObject, encodeStream } = require('../../../../../common/utils/stream-utils');

module.exports = ({ db, configuration, password, middlewares }) => {

    const POLE_EMPLOI = '4';
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

    router.get('/backoffice/organisme/:token', tryAndCatch(async (req, res) => {

        let organisme = await db.collection('accounts').findOne({ token: req.params.token });
        if (organisme) {
            return res.json({
                raisonSociale: organisme.raisonSociale,
                siret: organisme.meta.siretAsString,
                activated: !!organisme.passwordHash,
            });
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
        let filter = { 'training.organisation.siret': req.params.id, 'archived': false };
        let order = { date: -1 };

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
            } else if (req.query.filter === 'answerRejected') {
                filter['reponse.status'] = 'rejected';
                order = { 'reponse.date': -1 };
            } else if (req.query.filter === 'all') {
                filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
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
        let filter = { 'training.organisation.siret': req.params.id, 'archived': false };
        let order = { date: -1 };

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
            } else if (req.query.filter === 'answerRejected') {
                filter['reponse.status'] = 'rejected';
                order = { 'reponse.date': -1 };
            } else if (req.query.filter === 'all') {
                filter.$or = [{ 'comment': { $exists: false } }, { 'comment': null }, { 'published': true }];
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

    router.get('/backoffice/organisme/:id/training/:idTraining/sessions', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

        checkOrganisme(req);

        const organisation = await db.collection('accounts').findOne({ _id: parseInt(req.params.id) });

        if (organisation) {
            let filter = { 'archived': false };
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
            const filter = { 'training.organisation.siret': `${req.params.id}`, 'archived': false };

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
            inventory.answerRejected = await db.collection('comment').countDocuments({
                ...filter,
                'reponse.status': 'rejected',
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
            const filter = { 'training.organisation.siret': `${req.params.id}`, 'archived': false };

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

            inventory.answerRejected = await db.collection('comment').countDocuments({
                ...filter,
                'reponse.status': 'rejected',
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
                        'training.organisation.siret': `${req.params.id}`,
                        'archived': false
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
                        noteGlobaleFive: { $sum: { $cond: [{ $and: [{ $gt: ['$rates.global', 4] }, { $lte: ['$rates.global', 5] }] }, 1, 0] } },
                        noteGlobaleFour: { $sum: { $cond: [{ $and: [{ $gt: ['$rates.global', 3] }, { $lte: ['$rates.global', 4] }] }, 1, 0] } },
                        noteGlobaleThree: { $sum: { $cond: [{ $and: [{ $gt: ['$rates.global', 2] }, { $lte: ['$rates.global', 3] }] }, 1, 0] } },
                        noteGlobaleTwo: { $sum: { $cond: [{ $and: [{ $gt: ['$rates.global', 1] }, { $lte: ['$rates.global', 2] }] }, 1, 0] } },
                        noteGlobaleOne: { $sum: { $cond: [{ $and: [{ $gte: ['$rates.global', 0] }, { $lte: ['$rates.global', 1] }] }, 1, 0] } },
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

            if (trainings.length > 0) {
                let traineeCount = await db.collection('trainee').count({ 'training.organisation.siret': `${req.params.id}` });
                trainings[0].traineeCount = traineeCount;
            }

            res.status(200).send(trainings);

        } else {
            res.status(404).send({ 'error': 'Not found' });
        }
    }));


    router.get('/backoffice/organisme/organismes_formateurs/:siren/training/:idTraining/sessions', checkAuth, checkProfile('organisme'), tryAndCatch(async (req, res) => {

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

    // TODO : don't generate on the fly (use cron for every region : see /jobs/export/region)
    router.get('/backoffice/organismes/avis.csv', checkAuth, tryAndCatch(async (req, res) => {

        let query = {};
        let getReponseStatus = reponse => {
            if (reponse.status === 'rejected') {
                return 'Rejetée';
            } else if (reponse.status === 'published') {
                return 'Validée';
            } else {
                return 'En attente de modération';
            }
        };

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
