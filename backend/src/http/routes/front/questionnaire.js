const express = require('express');
const moment = require('moment');
const { getDeviceType } = require('./utils/analytics');
const Joi = require('joi');
const s = require('string');
const externalLinks = require('./utils/externalLinks');
const { sanitize } = require('./utils/userInput');

module.exports = ({ db, logger, configuration }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let badwords = require('./utils/badwords')(logger, configuration);

    const getTraineeFromToken = (req, res, next) => {
        db.collection('trainee').findOne({ token: req.params.token })
        .then(trainee => {
            if (!trainee) {
                res.status(404).render('errors/404');
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
            accompagnement: rateRule,
            global: rateRule,
        });
        let rates = {
            accueil: body.avis_accueil,
            contenu_formation: body.avis_contenu_formation,
            equipe_formateurs: body.avis_equipe_formateurs,
            moyen_materiel: body.avis_moyen_materiel,
            accompagnement: body.avis_accompagnement,
            global: body.avis_global
        };

        return Joi.validate(rates, schema);
    };

    const validateAvis = (notes, body) => {
        let avis = {};
        avis.rates = notes;

        let pseudo = sanitize(body.pseudo);
        let commentTxt = sanitize(body.commentaire);
        let commentTitle = sanitize(body.titreCommentaire);

        if (s(pseudo.replace(/ /g, '')).isAlphaNumeric()) {
            avis.pseudo = pseudo;
            if (commentTitle !== '' || commentTxt !== '') {
                avis.comment = {
                    title: commentTitle,
                    text: commentTxt
                };
            }
            avis.accord = body.accord === 'on';
            avis.accordEntreprise = body.accordEntreprise === 'on';

            let pseudoOK = badwords.isGood(pseudo);
            let commentOK = badwords.isGood(commentTxt);
            let commentTitleOK = badwords.isGood(commentTitle);

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
        } else {
            return { error: 'alphanum' };
        }
    };

    const getInfosRegion = async trainee => {
        const carif = await db.collection('carif').findOne({ codeRegion: trainee.codeRegion });

        const trainingTooOld = trainee.training.scheduledEndDate < moment().subtract(90, 'days');

        return {
            trainee: trainee,
            carifURL: carif.url,
            carifLinkEnabled: carif.formLinkEnabled,
            showLinks: await externalLinks(db).getLink(trainee, 'pe') !== null && !trainingTooOld
        };
    };

    router.get('/questionnaire/:token/start', getTraineeFromToken, saveDeviceData, async (req, res) => {

        let trainee = req.trainee;
        let comment = await db.collection('comment').findOne({
            token: req.params.token,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession
        });

        if (!comment) {
            db.collection('trainee').updateOne({ token: req.params.token }, { $set: { 'tracking.click': new Date() } });
            res.send({ trainee: trainee });
        } else {
            res.send({ error: true, reason: 'already sent' });
        }
    });

    router.post('/questionnaire/:token', getTraineeFromToken, async (req, res) => {

        let trainee = req.trainee;
        let comment = await db.collection('comment').findOne({
            token: req.params.token,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession
        });

        if (comment !== null) {
            res.send({ error: true, reason: 'already sent', trainee: trainee });
        } else {
            let resultNotes = validateNotes(req.body);
            if (resultNotes.error === null) {
                let resultAvis = validateAvis(resultNotes.value, req.body);
                if (resultAvis.error === null) {
                    await Promise.all([
                        db.collection('comment').saveOne(resultAvis.avis),
                        db.collection('trainee').updateOne({ _id: trainee._id }, { $set: { avisCreated: true } }),
                    ]);
                    let infos = await getInfosRegion(trainee);
                    res.send(infos);
                } else {
                    res.send({ error: true, reason: resultAvis.error });
                }
            }
        }
    });

    return router;
};
