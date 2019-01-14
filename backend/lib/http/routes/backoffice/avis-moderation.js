const express = require('express');
const moment = require('moment');
const mongo = require('mongodb');
const s = require('string');
const { tryAndCatch } = require('../routes-utils');
const { encodeStream } = require('iconv-lite');
const Boom = require('boom');
const ObjectID = require('mongodb').ObjectID;
const Joi = require('joi');
const { transformObject } = require('../../../common/stream-utils');

module.exports = ({ db, createJWTAuthMiddleware, checkProfile, logger, configuration, mailer, mailing }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = createJWTAuthMiddleware('backoffice');
    const pagination = configuration.api.pagination;

    const POLE_EMPLOI = '4';

    const saveEvent = function(id, type, source) {
        db.collection('events').save({ adviceId: id, date: new Date(), type: type, source: source });
    };

    const sendEmailAsync = (trainee, comment, reason) => {
        let contact = trainee.trainee.email;
        if (reason === 'non concerné') {
            mailer.sendAvisHorsSujetMail({ to: contact }, trainee, comment, () => {
                logger.info(`email sent to ${contact}`, reason);
            }, err => {
                logger.error(`Unable to send email to ${contact}`, err);
            });
        }
    };

    const getRemoteAddress = req => {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    };

    router.get('/backoffice/status', checkAuth, checkProfile('moderateur'), (req, res) => {
        res.send({ 'status': 'OK' });
    });

    router.get('/backoffice/avis.json', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let advices = await db.collection('comment').find({ step: { $gte: 2 } }, { token: 0 }).limit(10).toArray();
        res.send(advices);
    }));

    // TODO : don't generate on the fly (use cron for every region : see /jobs/export/region)
    router.get('/avis.csv', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        let query = {
            $or: [
                { 'comment': { $exists: false } },
                { 'comment': null },
                { 'published': true }
            ],
            step: { $gte: 2 }
        };

        if (req.query.filter === 'region') {
            query['training.infoRegion'] = { $ne: null };
        }

        if (req.user.profile === 'organisme') {
            query['training.organisation.siret'] = req.user.siret;
        } else if (req.user.profile === 'financer') {
            query['codeRegion'] = req.user.codeRegion;
            if (req.user.codeFinanceur !== POLE_EMPLOI) {
                query['training.codeFinanceur'] = { '$elemMatch': { '$eq': req.user.codeFinanceur } };
            } else if (req.user.codeFinanceur === POLE_EMPLOI && req.query.codeFinanceur) {
                query['training.codeFinanceur'] = { '$elemMatch': { '$eq': req.query.codeFinanceur } };
            }

            if (req.query.siret) {
                query['training.organisation.siret'] = req.query.siret;
            }
            if (req.query.postalCode) {
                query['training.place.postalCode'] = req.query.postalCode;
            }
            if (req.query.trainingId) {
                query['training.idFormation'] = req.query.trainingId;
            }
        }

        let stream = await db.collection('comment').find(query, { token: 0 }).stream();
        res.setHeader('Content-disposition', 'attachment; filename=avis.csv');
        res.setHeader('Content-Type', 'text/csv; charset=iso-8859-1');
        res.write('id;note accueil;note contenu formation;note equipe formateurs;note matériel;note accompagnement;note global;pseudo;titre;commentaire;campagne;etape;date;accord;id formation; titre formation;date début;date de fin prévue;id organisme; siret organisme;libellé organisme;nom organisme;code postal;ville;id certif info;libellé certifInfo;id session;formacode;AES reçu;référencement;id session aude formation;numéro d\'action;numéro de session;code financeur\n');

        let handleError = e => {
            logger.error('An error occurred', e);
            res.status(500);
            stream.push(Boom.boomify(e).output.payload);
        };

        stream
        .on('error', handleError)
        .pipe(transformObject(async comment => {
            if (comment.comment !== undefined && comment.comment !== null) {
                comment.comment.pseudo = (comment.comment.pseudo !== undefined) ? comment.comment.pseudo.replace(/\r?\n|\r/g, ' ') : '';
                comment.comment.title = (comment.comment.title !== undefined) ? comment.comment.title.replace(/\r?\n|\r/g, ' ') : '';
                comment.comment.text = (comment.comment.text !== undefined) ? comment.comment.text.replace(/\r?\n|\r/g, ' ') : '';
            }
            return comment._id + ';' +
                (comment.rates !== undefined ? comment.rates.accueil : '') + ';' +
                (comment.rates !== undefined ? comment.rates.contenu_formation : '') + ';' +
                (comment.rates !== undefined ? comment.rates.equipe_formateurs : '') + ';' +
                (comment.rates !== undefined ? comment.rates.moyen_materiel : '') + ';' +
                (comment.rates !== undefined ? comment.rates.accompagnement : '') + ';' +
                (comment.rates !== undefined ? comment.rates.global : '') + ';' +
                (comment.comment !== undefined && comment.comment !== null ? s(comment.comment.pseudo).replaceAll(';', '').replaceAll('"', '').s : '') + ';' +
                (comment.comment !== undefined && comment.comment !== null ? s(comment.comment.title).replaceAll(';', '').replaceAll('"', '').s : '') + ';' +
                (comment.comment !== undefined && comment.comment !== null ? s(comment.comment.text).replaceAll(';', '').replaceAll('"', '').s : '') + ';' +
                comment.campaign + ';' +
                comment.step + ';' +
                comment.date + ';' +
                comment.accord + ';' +
                comment.training.idFormation + ';' +
                comment.training.title + ';' +
                moment(comment.training.startDate).format('DD/MM/YYYY') + ';' +
                moment(comment.training.scheduledEndDate).format('DD/MM/YYYY') + ';' +
                comment.training.organisation.id + ';' +
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
                comment.training.referencement + ';' +
                comment.training.idSessionAudeFormation + ';' +
                (comment.infoCarif !== undefined ? comment.infoCarif.numeroAction : '') + ';' +
                (comment.infoCarif !== undefined ? comment.infoCarif.numeroSession : '') + ';' +
                comment.training.codeFinanceur + '\n';
        }))
        .pipe(encodeStream('UTF-16BE'))
        .pipe(res);
    }));

    router.get('/backoffice/avis/:codeRegion/', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        if (req.params.codeRegion !== req.user.codeRegion) {
            throw Boom.forbidden('Action non autorisé');
        }

        const projection = { token: 0 };
        let filter = { 'step': { $gte: 2 }, 'comment': { $ne: null }, 'codeRegion': `${req.params.codeRegion}` };
        if (req.query.filter) {
            if (req.query.filter === 'reported') {
                filter.reported = true;
            } else if (req.query.filter === 'rejected') {
                filter.rejected = true;
            } else if (req.query.filter === 'published') {
                filter.published = true;
            } else if (req.query.filter === 'toModerate') {
                filter.moderated = { $ne: true };
            }
        }

        let order = { date: 1 };
        if (req.query.order) {
            if (req.query.order === 'moderation') {
                order = { lastModerationAction: -1 };
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

            }
        }
        const count = await db.collection('comment').countDocuments(filter);
        if (count < skip) {
            res.send({ error: 404 });
            return;
        }
        const avis = await db.collection('comment').find(filter, projection).sort(order).skip(skip).limit(pagination).toArray();

        res.send({
            avis: avis,
            page: page,
            pageCount: Math.ceil(count / pagination),
            elementsPerPage: pagination,
            elementsOnThisPage: avis.length,
        });
    }));

    router.put('/backoffice/avis/:id/markAsRead', checkAuth, checkProfile('moderateur'), tryAndCatch((req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { read: true } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'markAsRead', {
                        app: 'organisation',
                        user: req.query.userId,
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.put('/backoffice/avis/:id/maskPseudo', checkAuth, checkProfile('moderateur'), tryAndCatch((req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap

        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { pseudoMasked: true } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'maskPseudo', {
                        app: 'moderation',
                        profile: 'moderateur',
                        user: req.query.userId,
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.put('/backoffice/avis/:id/unmaskPseudo', checkAuth, checkProfile('moderateur'), tryAndCatch((req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { pseudoMasked: false } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'maskPseudo', {
                        app: 'moderation',
                        profile: 'moderateur',
                        user: req.query.userId,
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.put('/backoffice/avis/:id/maskTitle', checkAuth, checkProfile('moderateur'), tryAndCatch((req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { titleMasked: true } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'maskTitle', {
                        app: 'moderation',
                        profile: 'moderateur',
                        user: req.query.userId,
                        ip: req.connection.remoteAddress
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.put('/backoffice/avis/:id/unmaskTitle', checkAuth, checkProfile('moderateur'), tryAndCatch((req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            { $set: { titleMasked: false } },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'maskTitle', {
                        app: 'moderation',
                        profile: 'moderateur',
                        user: req.query.userId,
                        ip: req.connection.remoteAddress
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.post('/backoffice/avis/:id/reject', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap

        db.collection('comment').findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    reported: false,
                    moderated: true,
                    rejected: true,
                    published: false,
                    rejectReason: req.body.reason,
                    lastModerationAction: new Date()
                }
            },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    //sendEmailAsync(trainee, comment, reason);
                    saveEvent(id, 'reject', {
                        app: 'moderation',
                        user: 'admin',
                        profile: 'moderateur',
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    }));

    router.delete('/backoffice/avis/:id', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap

        db.collection('comment').removeOne({ _id: id }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'delete', {
                    app: 'moderation',
                    profile: 'moderateur',
                    user: req.query.userId,
                    ip: req.connection.remoteAddress
                });
                res.status(200).send({ 'message': 'advice deleted' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    }));

    router.post('/backoffice/avis/:id/publish', checkAuth, checkProfile('moderateur'), (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        const answer = req.body.answer;

        db.collection('comment').findOneAndUpdate(
            { _id: id }, {
                $set: {
                    answer: answer,
                    answered: true,
                    read: true
                }
            },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'answer', {
                        app: 'organisation',
                        user: req.query.userId,
                        ip: getRemoteAddress(req),
                        answer: answer
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    });

    router.post('/backoffice/avis/:id/update', checkAuth, checkProfile('moderateur'), (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    'reported': false,
                    'moderated': true,
                    'published': true,
                    'rejected': false,
                    'qualification': req.body.qualification,
                    'editedComment': { text: req.body.text, date: new Date() },
                    'lastModerationAction': new Date()
                }
            },
            { returnOriginal: false },
            (err, result) => {
                if (err) {
                    logger.error(err);
                    res.status(500).send({ 'error': 'An error occurs' });
                } else if (result.value) {
                    saveEvent(id, 'publish', {
                        app: 'moderation',
                        user: 'admin',
                        profile: 'moderateur',
                        ip: getRemoteAddress(req)
                    });
                    res.json(result.value);
                } else {
                    res.status(404).send({ 'error': 'Not found' });
                }
            });
    });

    router.get('/backoffice/avis/:codeRegion/inventory', checkAuth, checkProfile('moderateur'), async (req, res) => {
        if (req.params.codeRegion !== req.user.codeRegion) {
            throw Boom.forbidden('Action non autorisé');
        }

        let inventory = {};
        const filter = { 'comment': { $ne: null }, 'step': { $gte: 2 }, 'codeRegion': `${req.params.codeRegion}` };
        const collection = await db.collection('comment');

        inventory.reported = await collection.countDocuments({ ...filter, reported: true });
        inventory.toModerate = await collection.countDocuments({ ...filter, moderated: { $ne: true } });
        inventory.rejected = await collection.countDocuments({ ...filter, rejected: true });
        inventory.published = await collection.countDocuments({ ...filter, published: true });
        inventory.all = await collection.countDocuments(filter);

        res.status(200).send(inventory);
    });

    router.get('/backoffice/avis/:id/resendEmail', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {
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

        await Promise.all([
            db.collection('comment').removeOne({ _id: new ObjectID(parameters.id) }),
            sendVotreAvisEmail(trainee),
        ]);

        res.json({ 'message': 'trainee email resent' });
    }));

    return router;
};
