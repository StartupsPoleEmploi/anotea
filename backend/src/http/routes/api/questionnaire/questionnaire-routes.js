const express = require('express');
const moment = require('moment');
const { getDeviceType } = require('./utils/analytics');
const Joi = require('joi');
const externalLinks = require('../../front/utils/externalLinks');
const { sanitize } = require('./utils/userInput');
const { tryAndCatch } = require('../../routes-utils');
const { AlreadySentError, BadDataError } = require('../../../../common/errors');

module.exports = ({ db, logger, configuration, regions, communes }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let badwords = require('./utils/badwords')(logger, configuration);

    const getTraineeFromToken = (req, res, next) => {
        db.collection('trainee').findOne({ token: req.params.token })
        .then(trainee => {
            if (!trainee) {
                res.status(404).send({ error: 'not found' });
                return;
            }

            req.trainee = trainee;
            next();
        });
    };

    const saveDeviceData = async (req, res, next) => {
        let trainee = req.trainee;
        let now = new Date();
        let lastSeenDate = trainee.lastSeenDate;
        let isNewSession = !lastSeenDate || Math.ceil(moment.duration(moment(now).diff(moment(lastSeenDate))).asMinutes()) > 30;
        let devices = getDeviceType(req.headers['user-agent']);

        db.collection('trainee').updateOne({ _id: trainee._id }, {
            ...(isNewSession && devices.phone ? { $inc: { 'deviceTypes.phone': 1 } } : {}),
            ...(isNewSession && devices.tablet ? { $inc: { 'deviceTypes.tablet': 1 } } : {}),
            ...(isNewSession && devices.desktop ? { $inc: { 'deviceTypes.desktop': 1 } } : {}),
            $set: { lastSeenDate: now }
        }).catch(e => logger.error(e));

        next();
    };

    const validateNotes = body => {
        const rateRule = Joi.number().integer().min(1).max(5).required();

        const schema = Joi.object().keys({
            accueil: rateRule,
            contenu_formation: rateRule,
            equipe_formateurs: rateRule,
            moyen_materiel: rateRule,
            accompagnement: rateRule
        });
        let rates = {
            accueil: body.avis_accueil,
            contenu_formation: body.avis_contenu_formation,
            equipe_formateurs: body.avis_equipe_formateurs,
            moyen_materiel: body.avis_moyen_materiel,
            accompagnement: body.avis_accompagnement
        };

        return Joi.validate(rates, schema);
    };

    const calculateAverageRate = avis => {
        let sum = avis.rates.accueil +
            avis.rates.contenu_formation +
            avis.rates.equipe_formateurs +
            avis.rates.moyen_materiel +
            avis.rates.accompagnement;

        return Number(Math.round((sum / 5) + 'e1') + 'e-1');
    };

    const sanitizeBody = body => {

        let sanitizedBody = Object.assign({}, body);

        sanitizedBody.pseudo = sanitize(body.pseudo);
        sanitizedBody.texte = sanitize(body.commentaire.texte);
        sanitizedBody.titre = sanitize(body.commentaire.titre);

        return sanitizedBody;
    };

    const buildAvis = (notes, token, body, trainee) => {
        let data = sanitizeBody(body);
        let avis = {
            date: new Date(),
            token: token,
            campaign: trainee.campaign,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession,
            training: trainee.training,
            codeRegion: trainee.codeRegion,
            rates: notes,
            pseudo: data.pseudo.replace(/ /g, '').replace(/\./g, ''),
            accord: data.accord,
            accordEntreprise: data.accordEntreprise,
            archived: false
        };

        let text = data.commentaire.texte;
        let title = data.commentaire.titre;
        if (title !== '' || text !== '') {
            avis.comment = {
                title: title,
                text: text
            };
        }

        return avis;
    };

    const validateAvis = avis => {

        if (avis.pseudo.length > 50 ||
            (avis.comment !== undefined && (avis.comment.title.length > 50 || avis.comment.text.length > 200))) {
            return { error: 'too long' };
        }

        let pseudoOK = avis.pseudo ? badwords.isGood(avis.pseudo) : true;
        let commentOK = avis.comment ? badwords.isGood(avis.comment.text) : true;
        let commentTitleOK = avis.comment ? badwords.isGood(avis.comment.title) : true;

        if (pseudoOK && commentOK && commentTitleOK) {
            return { error: null, avis };
        } else {
            let badwords = {
                pseudo: !pseudoOK,
                comment: !commentOK,
                commentTitle: !commentTitleOK
            };
            return { error: 'badwords', badwords };
        }

    };

    const getInfosRegion = async trainee => {

        let trainingTooOld = trainee.training.scheduledEndDate < moment().subtract(90, 'days');
        let region = regions.findRegionByCodeRegion(trainee.codeRegion);

        return {
            trainee: trainee,
            region: region,
            showLinks: await externalLinks(db, communes).getLink(trainee, 'pe') !== null && !trainingTooOld
        };
    };

    router.get('/questionnaire/checkBadwords', tryAndCatch(async (req, res) => {
        res.send({ isGood: badwords.isGood(req.query.sentence) });
    }));

    router.get('/questionnaire/:token', getTraineeFromToken, saveDeviceData, tryAndCatch(async (req, res) => {

        let stagiaire = req.trainee;
        let [comment, infosRegion] = await Promise.all([
            db.collection('comment').findOne({
                'token': req.params.token,
                'training.formacode': stagiaire.training.formacode,
                'training.idSession': stagiaire.training.idSession
            }),
            getInfosRegion(stagiaire)
        ]);

        if (!comment) {
            db.collection('trainee').updateOne({ token: req.params.token }, { $set: { 'tracking.click': new Date() } });
        }

        return res.send({ stagiaire, infosRegion, submitted: !!comment });
    }));

    router.post('/questionnaire/:token', getTraineeFromToken, tryAndCatch(async (req, res) => {

        let stagiaire = req.trainee;
        let [comment, infosRegion] = await Promise.all([
            db.collection('comment').findOne({
                token: req.params.token,
                formacode: stagiaire.training.formacode,
                idSession: stagiaire.training.idSession
            }),
            getInfosRegion(stagiaire)
        ]);

        if (comment) {
            throw new AlreadySentError();
        }

        let resultNotes = validateNotes(req.body);
        if (resultNotes.error === null) {

            const avis = buildAvis(resultNotes.value, req.params.token, req.body, req.trainee);

            let validation = validateAvis(avis);
            if (validation.error === null) {
                avis.rates.global = calculateAverageRate(avis);
                await Promise.all([
                    db.collection('comment').insertOne(avis),
                    db.collection('trainee').updateOne({ _id: stagiaire._id }, { $set: { avisCreated: true } }),
                ]);
            } else {
                throw new BadDataError();
            }
        } else {
            throw new BadDataError();
        }
        return res.send({ stagiaire, infosRegion });
    }));

    return router;
};
