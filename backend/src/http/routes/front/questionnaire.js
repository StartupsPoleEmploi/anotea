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

    router.get('/questionnaire/:token/start', getTraineeFromToken, saveDeviceData, async (req, res) => {

        let trainee = req.trainee;
        // We check if advice not already sent
        let comment = await db.collection('comment').findOne({
            token: req.params.token,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession
        });

        if (!comment) {
            db.collection('trainee').updateOne({ token: req.params.token }, { $set: { 'tracking.click': new Date() } });
            res.send({ trainee: trainee });
        } else {
            res.send({ error: true, reason: 'already sent', trainee: trainee });
        }
    });

    router.post('/questionnaire/:token', getTraineeFromToken, async (req, res) => {

        let trainee = req.trainee;
        let comment = await db.collection('comment').findOne({
            token: req.params.token,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession
        });

        // we let user change it's advice if last step not validated
        if (comment !== null && comment.step === 3) {
            res.send({ error: true, reason: 'already sent', trainee: trainee });
        } else if (comment !== null) {

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
                accueil: req.body.avis_accueil,
                contenu_formation: req.body.avis_contenu_formation,
                equipe_formateurs: req.body.avis_equipe_formateurs,
                moyen_materiel: req.body.avis_moyen_materiel,
                accompagnement: req.body.avis_accompagnement,
                global: req.body.avis_global
            };

            const result = Joi.validate(rates, schema);
            if (result.error === null) {
                comment.rates = result.value;
                comment.accord = false;
                comment.accordEntreprise = false;
                comment.step = 3;

                let pseudo = sanitize(req.body.pseudo);
                let commentTxt = sanitize(req.body.commentaire);
                let commentTitle = sanitize(req.body.titreCommentaire);

                if (s(pseudo.replace(/ /g, '')).isAlphaNumeric()) {
                    comment.pseudo = pseudo;
                    if (commentTitle !== '' || commentTxt !== '') {
                        comment.comment = {
                            title: commentTitle,
                            text: commentTxt
                        };
                    }
                    comment.accord = req.body.accord === 'on';
                    comment.accordEntreprise = req.body.accordEntreprise === 'on';

                    let pseudoOK = badwords.isGood(pseudo);
                    let commentOK = badwords.isGood(commentTxt);
                    let commentTitleOK = badwords.isGood(commentTitle);
                    if (pseudoOK && commentOK && commentTitleOK) {
                        comment.step = 3;
                        delete comment.badwords;
                        db.collection('comment').updateOne({ _id: comment._id }, { $set: comment });
                        res.redirect(`/questionnaire/${req.params.token}/step3`);
                        return;
                    } else {
                        let badwords = {
                            pseudo: !pseudoOK,
                            comment: !commentOK,
                            commentTitle: !commentTitleOK
                        };
                        res.send({ error: true, reason: 'badwords', badwords });
                    }

                    await Promise.all([
                        db.collection('comment').updateOne({ _id: comment._id }, { $set: comment }),
                        db.collection('trainee').updateOne({ _id: trainee._id }, { $set: { avisCreated: true } }),
                    ]);

                    const carif = await db.collection('carif').findOne({ codeRegion: trainee.codeRegion });

                    const trainingTooOld = trainee.training.scheduledEndDate < moment().subtract(90, 'days');
            
                    res.send({
                        trainee: trainee,
                        carifURL: carif.url,
                        carifLinkEnabled: carif.formLinkEnabled,
                        showLinks: await externalLinks(db).getLink(trainee, 'pe') !== null && !trainingTooOld
                    });
                } else {
                    res.send({ error: true, reason: 'alphanum', trainee });
                    return;
                }
            } else {
                res.send({ error: true, reason: 'bad data', trainee });
            }
        } else {
            res.send({ error: true, reason: 'bad data', trainee });
        }
    });

    return router;
};
