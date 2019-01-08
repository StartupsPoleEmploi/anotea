const express = require('express');
const moment = require('moment');
const mongo = require('mongodb');
const s = require('string');
const tryAndCatch = require('../tryAndCatch');

module.exports = ({ db, createJWTAuthMiddleware, logger, configuration, mailer }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    const checkAuth = createJWTAuthMiddleware('backoffice');
    const pagination = configuration.api.pagination;

    const POLE_EMPLOI = '4';

    const sendEmailAsync = (trainee, comment, reason) => {
        let contact = trainee.trainee.email;
        if (reason === 'non concerné') {
            mailer.sendAvisHorsSujetMail({ to: contact }, trainee, comment, () => {
                logger.info(`email sent to ${contact}`, err);
            }, err => {
                logger.error(`Unable to send email to ${contact}`, err);
            });
        }
    };

    const getRemoteAddress = req => {
        return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    };

    router.get('/backoffice/status', checkAuth, (req, res) => {
        res.send({ 'status': 'OK' });
    });

    router.get('/backoffice/advices.json', checkAuth, async (req, res) => {
        let advices = await db.collection('comment').find({ step: { $gte: 2 } }, { token: 0 }).limit(10).toArray();
        res.send(advices);
    });

    // TODO : don't generate on the fly (use cron for every region : see /jobs/export/region)
    router.get('/avis.csv', checkAuth, tryAndCatch(async (req, res) => {
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
        
        const advices = await db.collection('comment').find(query, { token: 0 }).toArray();
        res.setHeader('Content-disposition', 'attachment; filename=avis.csv');
        res.setHeader('Content-Type', 'text/csv; charset=iso-8859-1');
        let lines = 'id;note accueil;note contenu formation;note equipe formateurs;note matériel;note accompagnement;note global;pseudo;titre;commentaire;campagne;etape;date;accord;id formation; titre formation;date début;date de fin prévue;id organisme; siret organisme;libellé organisme;nom organisme;code postal;ville;id certif info;libellé certifInfo;id session;formacode;AES reçu;référencement;id session aude formation;numéro d\'action;numéro de session;code financeur\n';
        advices.forEach(comment => {
            if (comment.comment !== undefined && comment.comment !== null) {
                comment.comment.pseudo = (comment.comment.pseudo !== undefined) ? comment.comment.pseudo.replace(/\r?\n|\r/g, ' ') : '';
                comment.comment.title = (comment.comment.title !== undefined) ? comment.comment.title.replace(/\r?\n|\r/g, ' ') : '';
                comment.comment.text = (comment.comment.text !== undefined) ? comment.comment.text.replace(/\r?\n|\r/g, ' ') : '';
            }
            lines += comment._id + ';' +
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
        });
        res.send(lines);
    }));

    router.get('/backoffice/advices/:codeRegion/', checkAuth, async (req, res) => {
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
        const advices = await db.collection('comment').find(filter, projection).sort(order).skip(skip).limit(pagination).toArray();

        res.send({
            advices: advices,
            page: page,
            pageCount: Math.ceil(count / pagination)
        });
    });

    const saveEvent = function(id, type, source) {
        db.collection('events').save({ adviceId: id, date: new Date(), type: type, source: source });
    };


    router.put('/backoffice/advice/:id/markAsRead', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, { $set: { read: true } }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'markAsRead', {
                    app: 'organisation',
                    user: req.query.userId,
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'advice marked as read' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.put('/backoffice/advice/:id/markAsNotRead', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, { $set: { read: false } }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'markAsNotRead', {
                    app: 'organisation',
                    user: req.query.userId,
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'advice marked as not read' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.put('/backoffice/advice/:id/maskPseudo', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, { $set: { pseudoMasked: true } }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'maskPseudo', {
                    app: 'moderation',
                    profile: 'moderateur',
                    user: req.query.userId,
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'pseudo masked masked' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.put('/backoffice/advice/:id/unmaskPseudo', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, { $set: { pseudoMasked: false } }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'maskPseudo', {
                    app: 'moderation',
                    profile: 'moderateur',
                    user: req.query.userId,
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'pseudo unmasked' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.put('/backoffice/advice/:id/maskTitle', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, { $set: { titleMasked: true } }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'maskTitle', {
                    app: 'moderation',
                    profile: 'moderateur',
                    user: req.query.userId,
                    ip: req.connection.remoteAddress
                });
                res.status(200).send({ 'message': 'pseudo masked masked' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.put('/backoffice/advice/:id/unmaskTitle', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, { $set: { titleMasked: false } }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'maskTitle', {
                    app: 'moderation',
                    profile: 'moderateur',
                    user: req.query.userId,
                    ip: req.connection.remoteAddress
                });
                res.status(200).send({ 'message': 'pseudo unmasked' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.put('/backoffice/advice/:id/report', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, { $set: { reported: true } }, function(err, result) {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'report', {
                    app: 'organisation',
                    user: req.query.userId,
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'advice reported' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.put('/backoffice/advice/:id/unreport', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, { $set: { reported: false, read: true } }, function(err, result) {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'report', {
                    app: 'organisation',
                    user: req.query.userId,
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'advice unreported' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.post('/backoffice/advice/:id/reject', checkAuth, tryAndCatch(async (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        const reason = req.body.reason;
        let comment = await db.collection('comment').findOne({ _id: id });
        let trainee = await db.collection('trainee').findOne({ token: comment.token });

        db.collection('comment').update({ _id: id }, {
            $set: {
                reported: false,
                moderated: true,
                rejected: true,
                published: false,
                rejectReason: req.body.reason,
                lastModerationAction: new Date()
            }
        }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                //sendEmailAsync(trainee, comment, reason);
                saveEvent(id, 'reject', {
                    app: 'moderation',
                    user: 'admin',
                    profile: 'moderateur',
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'advice rejected' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    }));

    router.delete('/backoffice/advice/:id', checkAuth, tryAndCatch(async (req, res) => {
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

    router.post('/backoffice/advice/:id/answer', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        const answer = req.body.answer;
        db.collection('comment').update({ _id: id }, {
            $set: {
                answer: answer,
                answered: true,
                read: true
            }
        }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'answer', {
                    app: 'organisation',
                    user: req.query.userId,
                    ip: getRemoteAddress(req),
                    answer: answer
                });
                res.status(200).send({ 'message': 'advice answered' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.delete('/backoffice/advice/:id/answer', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, {
            $set: { answered: false },
            $unset: { answer: '' }
        }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'answer removed', {
                    app: 'organisation',
                    user: req.query.userId,
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'advice answer removed' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.post('/backoffice/advice/:id/publish', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, {
            $set: {
                reported: false,
                moderated: true,
                published: true,
                rejected: false,
                rejectReason: null,
                qualification: req.body.qualification,
                lastModerationAction: new Date()
            }
        }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.result.n === 1) {
                saveEvent(id, 'publish', {
                    app: 'moderation',
                    user: 'admin',
                    profile: 'moderateur',
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'advice published' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.post('/backoffice/advice/:id/update', checkAuth, (req, res) => {
        const id = mongo.ObjectID(req.params.id); // eslint-disable-line new-cap
        db.collection('comment').update({ _id: id }, {
            $set: {
                'reported': false,
                'moderated': true,
                'published': true,
                'rejected': false,
                'qualification': req.body.qualification,
                'editedComment': { text: req.body.text, date: new Date() },
                'lastModerationAction': new Date()
            }
        }, (err, result) => {
            if (err) {
                logger.error(err);
                res.status(500).send({ 'error': 'An error occurs' });
            } else if (result.n === 1) {
                saveEvent(id, 'publish', {
                    app: 'moderation',
                    user: 'admin',
                    profile: 'moderateur',
                    ip: getRemoteAddress(req)
                });
                res.status(200).send({ 'message': 'advice updated' });
            } else {
                res.status(404).send({ 'error': 'Not found' });
            }
        });
    });

    router.get('/backoffice/advices/:codeRegion/inventory', checkAuth, async (req, res) => {
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

    return router;
};
